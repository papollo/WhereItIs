import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../shared/api-error';
import { RoomEditorActionsComponent } from '../../components/room-editor-actions.component';
import { RoomFormComponent, type RoomFormValue } from '../../components/room-form.component';
import { RoomGridEditorComponent } from '../../components/room-grid-editor.component';
import { RoomEditorFacade } from '../../room-editor.facade';
import {
  RoomGridEditorService,
  type RoomGridCell,
  type RoomGridState,
} from '../../room-grid-editor.service';
import type { CreateRoomCommand, UpdateRoomCommand } from '../../rooms.types';

@Component({
  selector: 'app-room-editor-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    RoomFormComponent,
    RoomGridEditorComponent,
    RoomEditorActionsComponent
],
  template: `
    @if (state$ | async; as state) {
      <section class="room-editor">
        <header class="room-editor__header">
          <div>
            <h1>{{ isEdit ? 'Edytuj pokoj' : 'Nowy pokoj' }}</h1>
            <p>Wypelnij dane i zaznacz ksztalt pokoju na siatce.</p>
          </div>
          <a mat-stroked-button routerLink="/rooms">Wroc do listy</a>
        </header>
        @if (state.isLoading) {
          <div class="room-editor__loading">
            <mat-progress-spinner diameter="32"></mat-progress-spinner>
            <span>Laduje dane pokoju...</span>
          </div>
        }
        @if (state.notFound && !state.isLoading) {
          <section class="room-editor__empty">
            <h2>Nie znaleziono pokoju</h2>
            <p>Sprawdz, czy link jest poprawny.</p>
          </section>
        }
        @if (!state.notFound) {
          <section class="room-editor__content">
            <app-room-form [value]="formValue" (valueChange)="updateForm($event)"></app-room-form>
            <div class="room-editor__grid">
              <h2>Siatka pokoju</h2>
              <p class="room-editor__hint">
                Kliknij komorki, aby je zaznaczyc. Kolejne komorki musza sie stykac.
              </p>
              <mat-button-toggle-group
                class="room-editor__brush"
                [value]="brushSize"
                (valueChange)="setBrushSize($event)"
                aria-label="Rozmiar pedzla"
                >
                <mat-button-toggle [value]="1">1x1</mat-button-toggle>
                <mat-button-toggle [value]="3">3x3</mat-button-toggle>
                <mat-button-toggle [value]="5">5x5</mat-button-toggle>
              </mat-button-toggle-group>
              <app-room-grid-editor
                [grid]="gridState"
                [fillColor]="formValue.color"
                [brushSize]="brushSize"
                (setCell)="setCell($event)"
              ></app-room-grid-editor>
              @if (validationError) {
                <p class="room-editor__error">{{ validationError }}</p>
              }
            </div>
            <app-room-editor-actions
              [canSave]="canSave()"
              [isSaving]="state.isSaving"
              (saveAction)="save()"
              (cancelAction)="cancel()"
            ></app-room-editor-actions>
          </section>
        }
      </section>
    }
    `,
  styleUrls: ['./room-editor-page.component.scss'],
})
export class RoomEditorPageComponent implements OnInit {
  private readonly facade = inject(RoomEditorFacade);
  private readonly gridService = inject(RoomGridEditorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly state$ = this.facade.state$;

  formValue: RoomFormValue = {
    name: '',
    color: '#aabbcc',
  };

  gridState: RoomGridState = this.gridService.createGrid(40, 40, false);
  brushSize = 1;

  isEdit = false;
  roomId = '';
  validationError: string | null = null;

  constructor() {
    this.facade.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state.room) {
          this.formValue = { name: state.room.name, color: state.room.color };
          const nextGrid = this.gridService.createGrid(40, 40, false);
          this.gridState = this.gridService.applyCells(nextGrid, state.cells);
        }
      });
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const roomId = params.get('roomId');
      void this.handleRoute(roomId);
    });
  }

  updateForm(value: RoomFormValue): void {
    this.formValue = value;
  }

  setCell(payload: { cell: RoomGridCell; filled: boolean }): void {
    const { cell, filled } = payload;
    this.gridState = this.gridService.setCell(this.gridState, cell, filled);
  }

  setBrushSize(size: number): void {
    this.brushSize = size;
  }

  async save(): Promise<void> {
    this.validationError = null;
    const filledCells = this.gridService.getFilledCells(this.gridState);
    if (filledCells.length === 0) {
      this.validationError = 'Wybierz przynajmniej jedna komorke siatki.';
      return;
    }

    const payload = this.buildPayload();

    try {
      if (this.isEdit) {
        await this.facade.updateRoom(this.roomId, payload as UpdateRoomCommand);
        await this.facade.replaceRoomCells(this.roomId, filledCells);
        this.snackBar.open('Pokoj zaktualizowany.', 'Zamknij', { duration: 3000 });
      } else {
        const created = await this.facade.createRoom(payload as CreateRoomCommand);
        await this.facade.replaceRoomCells(created.id, filledCells);
        this.snackBar.open('Pokoj utworzony.', 'Zamknij', { duration: 3000 });
        void this.router.navigate(['/rooms', created.id]);
        return;
      }

      void this.router.navigate(['/rooms', this.roomId]);
    } catch (err: unknown) {
      this.showError(err);
    }
  }

  cancel(): void {
    if (this.isEdit) {
      void this.router.navigate(['/rooms', this.roomId]);
      return;
    }

    void this.router.navigate(['/rooms']);
  }

  canSave(): boolean {
    return this.formValue.name.trim().length > 0 && this.formValue.color.trim().length > 0;
  }

  private buildPayload(): CreateRoomCommand {
    return {
      name: this.formValue.name.trim(),
      color: this.formValue.color.trim(),
    };
  }

  private showError(err: unknown): void {
    const message = this.formatError(err);
    this.snackBar.open(message, 'Zamknij', { duration: 4000 });
  }

  private formatError(error: unknown): string {
    if (error instanceof ApiError) {
      return error.details?.['name'] ?? error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Wystapil nieznany blad.';
  }

  private async handleRoute(roomId: string | null): Promise<void> {
    if (roomId) {
      this.isEdit = true;
      this.roomId = roomId;
      try {
        await this.facade.load(roomId);
      } catch (err: unknown) {
        this.showError(err);
      }
      return;
    }

    this.isEdit = false;
    this.roomId = '';
    this.validationError = null;
    this.formValue = {
      name: '',
      color: '#aabbcc',
    };
    this.gridState = this.gridService.createGrid(40, 40, false);
    this.facade.reset();
  }
}

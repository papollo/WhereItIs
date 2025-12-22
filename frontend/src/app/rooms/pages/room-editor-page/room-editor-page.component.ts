import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../shared/api-error';
import { RoomEditorActionsComponent } from '../../components/room-editor-actions.component';
import { RoomFormComponent, type RoomFormValue } from '../../components/room-form.component';
import { RoomEditorFacade } from '../../room-editor.facade';
import type { CreateRoomCommand, UpdateRoomCommand } from '../../rooms.types';

@Component({
  selector: 'app-room-editor-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    RoomFormComponent,
    RoomEditorActionsComponent,
  ],
  template: `
    <section class="room-editor" *ngIf="state$ | async as state">
      <header class="room-editor__header">
        <div>
          <h1>{{ isEdit ? 'Edytuj pokoj' : 'Nowy pokoj' }}</h1>
          <p>Wypelnij dane pokoju.</p>
        </div>
        <a mat-stroked-button routerLink="/rooms">Wroc do listy</a>
      </header>

      <div class="room-editor__loading" *ngIf="state.isLoading">
        <mat-progress-spinner diameter="32"></mat-progress-spinner>
        <span>Laduje dane pokoju...</span>
      </div>

      <section *ngIf="state.notFound && !state.isLoading" class="room-editor__empty">
        <h2>Nie znaleziono pokoju</h2>
        <p>Sprawdz, czy link jest poprawny.</p>
      </section>

      <section class="room-editor__content" *ngIf="!state.notFound">
        <app-room-form [value]="formValue" (valueChange)="updateForm($event)"></app-room-form>

        <app-room-editor-actions
          [canSave]="canSave()"
          [isSaving]="state.isSaving"
          (save)="save()"
          (cancel)="cancel()"
        ></app-room-editor-actions>
      </section>
    </section>
  `,
  styleUrls: ['./room-editor-page.component.scss'],
})
export class RoomEditorPageComponent implements OnInit {
  private readonly facade = inject(RoomEditorFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly state$ = this.facade.state$;

  formValue: RoomFormValue = {
    name: '',
    color: '#aabbcc',
  };

  isEdit = false;
  roomId = '';

  constructor() {
    this.facade.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state.room) {
          this.formValue = { name: state.room.name, color: state.room.color };
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

  async save(): Promise<void> {
    const payload = this.buildPayload();

    try {
      if (this.isEdit) {
        await this.facade.updateRoom(this.roomId, payload as UpdateRoomCommand);
        this.snackBar.open('Pokoj zaktualizowany.', 'Zamknij', { duration: 3000 });
      } else {
        const created = await this.facade.createRoom(payload as CreateRoomCommand);
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
    this.formValue = {
      name: '',
      color: '#aabbcc',
    };
    this.facade.reset();
  }
}

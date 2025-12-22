import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '../../../shared/api-error';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import {
  FurnitureFormDialogComponent,
  type FurnitureFormValue,
} from '../../../furniture/components/furniture-form-dialog.component';
import { FurnitureListComponent } from '../../../furniture/components/furniture-list.component';
import type { FurnitureListItemVM } from '../../../furniture/furniture.view-models';
import { RoomGridPreviewComponent } from '../../components/room-grid-preview.component';
import { RoomDetailsFacade } from '../../room-details.facade';

@Component({
  selector: 'app-room-details-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    RoomGridPreviewComponent,
    FurnitureListComponent,
  ],
  templateUrl: './room-details-page.component.html',
  styleUrls: ['./room-details-page.component.scss'],
})
export class RoomDetailsPageComponent implements OnInit {
  private readonly facade = inject(RoomDetailsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly state$ = this.facade.state$;

  highlightedFurnitureId?: string;
  private furnitureSnapshot: FurnitureListItemVM[] = [];

  constructor() {
    this.facade.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => (this.furnitureSnapshot = state.furniture));

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.highlightedFurnitureId = params.get('furnitureId') ?? undefined;
      });
  }

  async ngOnInit(): Promise<void> {
    const roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
    const initialFurnitureId = this.route.snapshot.queryParamMap.get('furnitureId');

    try {
      await this.facade.load(roomId);
      if (initialFurnitureId) {
        await this.editFurniture(roomId, initialFurnitureId);
      }
    } catch (err: unknown) {
      this.showError(err);
    }
  }

  async addFurniture(roomId: string): Promise<void> {
    const dialogRef = this.dialog.open(FurnitureFormDialogComponent, {
      data: {
        title: 'Dodaj mebel',
        submitLabel: 'Zapisz',
      },
    });

    const value = await firstValueFrom(dialogRef.afterClosed());
    if (!value) {
      return;
    }

    await this.applyCreateFurniture(roomId, value);
  }

  async editFurniture(roomId: string, furnitureId: string): Promise<void> {
    const current = this.furnitureSnapshot.find((item) => item.id === furnitureId);
    if (!current) {
      return;
    }

    const dialogRef = this.dialog.open(FurnitureFormDialogComponent, {
      data: {
        title: 'Edytuj mebel',
        submitLabel: 'Zapisz',
        value: {
          name: current.name,
          description: current.description ?? '',
          color: current.color,
        },
      },
    });

    const value = await firstValueFrom(dialogRef.afterClosed());
    if (!value) {
      return;
    }

    try {
      await this.facade.updateFurniture(furnitureId, normalizeFurnitureForm(value));
      this.snackBar.open('Mebel zaktualizowany.', 'Zamknij', { duration: 3000 });
    } catch (err: unknown) {
      this.showError(err);
    }
  }

  async deleteFurniture(furnitureId: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Usun mebel',
        message: 'Czy na pewno chcesz usunac mebel? Znikna tez przypisane przedmioty.',
        confirmText: 'Usun',
        cancelText: 'Anuluj',
      },
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    try {
      await this.facade.deleteFurniture(furnitureId);
      this.snackBar.open('Mebel zostal usuniety.', 'Zamknij', { duration: 3000 });
    } catch (err: unknown) {
      this.showError(err);
    }
  }

  openFurniture(roomId: string, furnitureId: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { furnitureId },
      queryParamsHandling: 'merge',
    });
    void this.editFurniture(roomId, furnitureId);
  }

  describeError(error: ApiError): string {
    if (error.details?.['name']) {
      return error.details['name'];
    }

    return error.message;
  }

  private async applyCreateFurniture(roomId: string, value: FurnitureFormValue): Promise<void> {
    try {
      await this.facade.createFurniture(roomId, normalizeFurnitureForm(value));
      this.snackBar.open('Mebel dodany.', 'Zamknij', { duration: 3000 });
    } catch (err: unknown) {
      this.showError(err);
    }
  }

  private showError(err: unknown): void {
    const message = this.formatError(err);
    this.snackBar.open(message, 'Zamknij', { duration: 4000 });
  }

  private formatError(error: unknown): string {
    if (error instanceof ApiError) {
      return this.describeError(error);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Wystapil nieznany blad.';
  }
}

function normalizeFurnitureForm(value: FurnitureFormValue): FurnitureFormValue {
  return {
    name: value.name.trim(),
    description: value.description.trim(),
    color: value.color.trim(),
  };
}

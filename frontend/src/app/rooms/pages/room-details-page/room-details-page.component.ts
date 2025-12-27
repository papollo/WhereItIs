import { AsyncPipe } from '@angular/common';
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
  type FurnitureFormResult,
} from '../../../furniture/components/furniture-form-dialog.component';
import { FurnitureListComponent } from '../../../furniture/components/furniture-list.component';
import { FurnitureItemsDialogComponent } from '../../../items/components/furniture-items-dialog.component';
import type { FurnitureListItemVM } from '../../../furniture/furniture.view-models';
import { RoomGridPreviewComponent } from '../../components/room-grid-preview.component';
import { RoomDetailsFacade, type CreateFurniturePayload, type FurniturePlacementVM } from '../../room-details.facade';

@Component({
  selector: 'app-room-details-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    RoomGridPreviewComponent,
    FurnitureListComponent
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
  hoveredFurnitureId?: string;
  isItemsDialogOpen = false;
  resetHoverToken = 0;
  private furnitureSnapshot: FurnitureListItemVM[] = [];
  private placementSnapshot: FurniturePlacementVM[] = [];

  constructor() {
    this.facade.state$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((state) => {
      this.furnitureSnapshot = state.furniture;
      this.placementSnapshot = state.placements;
    });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.highlightedFurnitureId = params.get('furnitureId') ?? undefined;
      });
  }

  async ngOnInit(): Promise<void> {
    const roomId = this.route.snapshot.paramMap.get('roomId') ?? '';

    try {
      await this.facade.load(roomId);
    } catch (err: unknown) {
      this.showError(err);
    }
  }

  async addFurniture(roomId: string): Promise<void> {
    const dialogRef = this.dialog.open(FurnitureFormDialogComponent, {
      data: {
        title: 'Dodaj mebel',
        submitLabel: 'Zapisz',
        roomId,
        roomCells: this.facade.snapshotCells,
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
        roomId,
        roomCells: this.facade.snapshotCells,
        placement: this.placementSnapshot.find((item) => item.furniture_id === furnitureId),
      },
    });

    const value = await firstValueFrom(dialogRef.afterClosed());
    if (!value) {
      return;
    }

    try {
      await this.facade.updateFurniture(
        furnitureId,
        normalizeFurniturePayload(value),
        value.placement
      );
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
    this.hoveredFurnitureId = undefined;
    this.resetHoverToken += 1;
    this.isItemsDialogOpen = true;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { furnitureId },
      queryParamsHandling: 'merge',
    });

    const current = this.furnitureSnapshot.find((item) => item.id === furnitureId);
    if (!current) {
      return;
    }

    const dialogRef = this.dialog.open(FurnitureItemsDialogComponent, {
      data: {
        furnitureId,
        furnitureName: current.name,
        roomId,
      },
      width: '720px',
      height: '50vh',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.highlightedFurnitureId = undefined;
      this.hoveredFurnitureId = undefined;
      this.isItemsDialogOpen = false;
      this.resetHoverToken += 1;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { furnitureId: null },
        queryParamsHandling: 'merge',
      });
    });
  }

  setHoveredFurniture(furnitureId: string | null): void {
    this.hoveredFurnitureId = furnitureId ?? undefined;
  }

  describeError(error: ApiError): string {
    if (error.details?.['name']) {
      return error.details['name'];
    }

    return error.message;
  }

  private async applyCreateFurniture(roomId: string, value: FurnitureFormResult): Promise<void> {
    try {
      await this.facade.createFurniture(
        roomId,
        normalizeFurniturePayload(value),
        value.placement
      );
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

function normalizeFurniturePayload(value: FurnitureFormResult): CreateFurniturePayload {
  return {
    name: value.name.trim(),
    description: value.description.trim(),
    color: value.color.trim(),
  };
}

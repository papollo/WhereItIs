import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '../../../shared/api-error';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { RoomsListFacade } from '../../rooms-list.facade';
import type { RoomListItemVM } from '../../rooms.view-models';
import { RoomsListComponent } from '../../components/rooms-list.component';
import { RoomsListHeaderComponent } from '../../components/rooms-list-header.component';

@Component({
  selector: 'app-rooms-list-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RoomsListHeaderComponent,
    RoomsListComponent
],
  templateUrl: './rooms-list-page.component.html',
  styleUrls: ['./rooms-list-page.component.scss'],
})
export class RoomsListPageComponent implements OnInit {
  private readonly facade = inject(RoomsListFacade);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly state$ = this.facade.state$;

  private roomsSnapshot: RoomListItemVM[] = [];

  constructor() {
    this.facade.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => (this.roomsSnapshot = state.rooms));
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.facade.loadRooms();
    } catch (err: unknown) {
      this.showError(err);
    }
  }

  createRoom(): void {
    void this.router.navigate(['/rooms/new']);
  }

  openRoom(roomId: string): void {
    void this.router.navigate(['/rooms', roomId]);
  }

  editRoom(roomId: string): void {
    void this.router.navigate(['/rooms', roomId, 'edit']);
  }

  async confirmDelete(roomId: string): Promise<void> {
    const room = this.roomsSnapshot.find((item) => item.id === roomId);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Usun pokoj',
        message: room
          ? `Czy na pewno chcesz usunac pokoj "${room.name}"?`
          : 'Czy na pewno chcesz usunac ten pokoj?',
        confirmText: 'Usun',
        cancelText: 'Anuluj',
      },
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    try {
      await this.facade.deleteRoom(roomId);
      this.snackBar.open('Pokoj zostal usuniety.', 'Zamknij', { duration: 3000 });
    } catch (err: unknown) {
      this.showError(err);
    }
  }

  describeError(error: ApiError): string {
    if (error.details?.['name']) {
      return error.details['name'];
    }

    return error.message;
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

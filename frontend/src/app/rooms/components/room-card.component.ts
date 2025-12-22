import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import type { RoomListItemVM } from '../rooms.view-models';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card class="room-card" (click)="open.emit(room.id)">
      <div class="room-card__color" [style.backgroundColor]="room.color" aria-hidden="true"></div>
      <div class="room-card__content">
        <div class="room-card__title">
          <h3>{{ room.name }}</h3>
        </div>
        <div class="room-card__actions">
          <button
            mat-stroked-button
            color="primary"
            type="button"
            (click)="handleEdit($event)"
            aria-label="Edytuj pokoj"
          >
            Edytuj
          </button>
          <button
            mat-stroked-button
            color="warn"
            type="button"
            (click)="handleDelete($event)"
            aria-label="Usun pokoj"
          >
            Usun
          </button>
        </div>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .room-card {
        display: grid;
        grid-template-columns: 12px 1fr;
        gap: 16px;
        cursor: pointer;
        padding: 6px 8px 6px 0;
      }

      .room-card__color {
        width: 12px;
        border-radius: 8px;
      }

      .room-card__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: nowrap;
      }

      .room-card__title {
        display: flex;
        align-items: baseline;
        gap: 12px;
        white-space: nowrap;
      }

      .room-card__title h3 {
        margin: 0;
        font-size: 1.1rem;
      }

      .room-card__actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class RoomCardComponent {
  @Input({ required: true }) room!: RoomListItemVM;
  @Output() open = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  handleEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.room.id);
  }

  handleDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.room.id);
  }
}

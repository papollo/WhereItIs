
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { RoomListItemVM } from '../rooms.view-models';
import { RoomCardComponent } from './room-card.component';

@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [RoomCardComponent],
  template: `
    <section class="rooms-list" aria-label="Lista pokojow">
      @for (room of rooms; track trackByRoomId($index, room)) {
        <app-room-card
          [room]="room"
          (open)="open.emit($event)"
          (edit)="edit.emit($event)"
          (delete)="delete.emit($event)"
          />
      }
    </section>
    `,
  styles: [
    `
      .rooms-list {
        display: grid;
        gap: 16px;
      }
    `,
  ],
})
export class RoomsListComponent {
  @Input({ required: true }) rooms: RoomListItemVM[] = [];
  @Output() open = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  trackByRoomId(index: number, room: RoomListItemVM): string {
    return room.id;
  }
}

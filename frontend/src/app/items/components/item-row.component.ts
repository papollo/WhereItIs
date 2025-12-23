import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { ItemListItemDto } from '../items.types';

@Component({
  selector: 'app-item-row',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="item-row">
      <span class="item-row__name">{{ item.name }}</span>
      <button
        mat-icon-button
        class="item-row__delete"
        type="button"
        (click)="delete.emit(item.id)"
        [disabled]="busy"
        aria-label="Usun przedmiot"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .item-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }

      .item-row__name {
        font-size: 0.95rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .item-row__delete {
        color: #d32f2f;
        font-size: 1.1rem;
        line-height: 1;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class ItemRowComponent {
  @Input({ required: true }) item!: ItemListItemDto;
  @Input() busy = false;
  @Output() delete = new EventEmitter<string>();
}

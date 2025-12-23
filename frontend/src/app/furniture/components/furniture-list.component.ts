import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { FurnitureListItemVM } from '../furniture.view-models';
import { FurnitureCardComponent } from './furniture-card.component';

@Component({
  selector: 'app-furniture-list',
  standalone: true,
  imports: [NgFor, FurnitureCardComponent],
  template: `
    <section class="furniture-list" aria-label="Lista mebli">
      <app-furniture-card
        *ngFor="let item of items; trackBy: trackByFurnitureId"
        [item]="item"
        [highlighted]="item.id === highlightedId"
        (open)="open.emit($event)"
        (edit)="edit.emit($event)"
        (delete)="delete.emit($event)"
        (hover)="hover.emit($event)"
      />
    </section>
  `,
  styles: [
    `
      .furniture-list {
        display: grid;
        gap: 16px;
      }
    `,
  ],
})
export class FurnitureListComponent {
  @Input({ required: true }) items: FurnitureListItemVM[] = [];
  @Input() highlightedId?: string;
  @Output() open = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() hover = new EventEmitter<string | null>();

  trackByFurnitureId(index: number, item: FurnitureListItemVM): string {
    return item.id;
  }
}

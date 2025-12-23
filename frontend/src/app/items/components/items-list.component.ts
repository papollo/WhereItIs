import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { ItemListItemDto } from '../items.types';
import { ItemRowComponent } from './item-row.component';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [NgFor, NgIf, ItemRowComponent],
  template: `
    <section class="items-list" aria-label="Lista przedmiotow">
      <p class="items-list__status" *ngIf="isLoading && items.length === 0">
        Laduje przedmioty...
      </p>
      <p class="items-list__status" *ngIf="!isLoading && items.length === 0">
        Brak przedmiotow.
      </p>
      <app-item-row
        *ngFor="let item of items; trackBy: trackByItemId"
        [item]="item"
        [busy]="busyIds?.has(item.id) ?? false"
        (delete)="delete.emit($event)"
      ></app-item-row>
    </section>
  `,
  styles: [
    `
      .items-list {
        display: grid;
        gap: 8px;
      }

      .items-list__status {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class ItemsListComponent {
  @Input({ required: true }) items: ItemListItemDto[] = [];
  @Input() isLoading = false;
  @Input() busyIds?: Set<string>;
  @Output() delete = new EventEmitter<string>();

  trackByItemId(_: number, item: ItemListItemDto): string {
    return item.id;
  }
}

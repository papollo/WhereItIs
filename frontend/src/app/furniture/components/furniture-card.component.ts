import { DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import type { FurnitureListItemVM } from '../furniture.view-models';

@Component({
  selector: 'app-furniture-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, DatePipe, NgIf],
  template: `
    <mat-card class="furniture-card">
      <div class="furniture-card__row">
        <div
          class="furniture-card__color"
          [style.backgroundColor]="item.color"
          aria-hidden="true"
        ></div>
        <div class="furniture-card__text" (click)="open.emit(item.id)">
          <div class="furniture-card__header">
            <h3>{{ item.name }}</h3>
            <span class="furniture-card__meta"
              >Aktualizacja: {{ item.updatedAt | date: 'mediumDate' }}</span
            >
          </div>
          <p *ngIf="item.description">{{ item.description }}</p>
        </div>
        <div class="furniture-card__actions">
          <button
            mat-stroked-button
            color="primary"
            type="button"
            (click)="handleEdit($event)"
            aria-label="Edytuj mebel"
          >
            Edytuj
          </button>
          <button
            mat-stroked-button
            color="warn"
            type="button"
            (click)="handleDelete($event)"
            aria-label="Usun mebel"
          >
            Usun
          </button>
        </div>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .furniture-card {
        display: grid;
        padding: 12px 16px;
        border-left: 4px solid transparent;
      }


      .furniture-card__row {
        display: grid;
        grid-template-columns: 12px minmax(0, 1fr) auto;
        gap: 16px;
        align-items: start;
      }

      .furniture-card__color {
        width: 12px;
        min-height: 36px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        align-self: stretch;
      }

      .furniture-card__text {
        min-width: 0;
        cursor: pointer;
      }

      .furniture-card__header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
      }

      .furniture-card__header h3 {
        margin: 0 0 4px;
      }

      .furniture-card__header p {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
        word-break: break-word;
      }

      .furniture-card__meta {
        font-size: 0.85rem;
        color: rgba(0, 0, 0, 0.6);
        white-space: nowrap;
      }

      .furniture-card__actions {
        display: flex;
        gap: 8px;
        justify-self: end;
      }

    `,
  ],
})
export class FurnitureCardComponent {
  @Input({ required: true }) item!: FurnitureListItemVM;
  @Input() highlighted = false;
  @Output() open = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  handleEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.item.id);
  }

  handleDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.item.id);
  }
}

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
    <mat-card class="furniture-card" [class.furniture-card--highlight]="highlighted">
      <div class="furniture-card__header" (click)="open.emit(item.id)">
        <div class="furniture-card__color" [style.backgroundColor]="item.color" aria-hidden="true"></div>
        <div>
          <h3>{{ item.name }}</h3>
          <p *ngIf="item.description">{{ item.description }}</p>
        </div>
      </div>
      <div class="furniture-card__meta">
        <span>Aktualizacja: {{ item.updatedAt | date: 'mediumDate' }}</span>
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
    </mat-card>
  `,
  styles: [
    `
      .furniture-card {
        display: grid;
        gap: 12px;
        border-left: 4px solid transparent;
      }

      .furniture-card--highlight {
        border-left-color: #e53935;
        background: #ffebee;
      }

      .furniture-card__header {
        display: grid;
        grid-template-columns: 12px 1fr;
        gap: 12px;
        cursor: pointer;
      }

      .furniture-card__color {
        width: 12px;
        border-radius: 8px;
      }

      .furniture-card__header h3 {
        margin: 0 0 4px;
      }

      .furniture-card__header p {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
      }

      .furniture-card__meta {
        font-size: 0.85rem;
        color: rgba(0, 0, 0, 0.6);
      }

      .furniture-card__actions {
        display: flex;
        gap: 8px;
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

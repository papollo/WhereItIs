import { NgFor } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import type { RoomGridCell, RoomGridState } from '../room-grid-editor.service';

@Component({
  selector: 'app-room-grid-editor',
  standalone: true,
  imports: [NgFor],
  template: `
    <section class="grid-editor" aria-label="Edytor siatki pokoju">
      <div
        class="grid-editor__grid"
        [style.gridTemplateColumns]="gridTemplateColumns"
        [style.--cell-size.px]="cellSizePx"
      >
        <button
          *ngFor="let cell of grid.cells; trackBy: trackByIndex"
          type="button"
          class="grid-editor__cell"
          [class.grid-editor__cell--filled]="cell.filled"
          (click)="handleClick(cell)"
          (pointerdown)="handlePointerDown(cell, $event)"
          (pointerenter)="handlePointerEnter(cell)"
          [attr.aria-pressed]="cell.filled"
          [attr.aria-label]="cell.filled ? 'Zaznaczona komorka' : 'Pusta komorka'"
        ></button>
      </div>
    </section>
  `,
  styles: [
    `
      .grid-editor__grid {
        display: grid;
        gap: 2px;
        background: rgba(0, 0, 0, 0.08);
        padding: 8px;
        border-radius: 12px;
        width: fit-content;
        max-width: 100%;
        overflow: auto;
      }

      .grid-editor__cell {
        width: var(--cell-size);
        height: var(--cell-size);
        border: 1px solid rgba(0, 0, 0, 0.05);
        background: #fff;
        border-radius: 2px;
        cursor: pointer;
      }

      .grid-editor__cell--filled {
        background: #212121;
      }
    `,
  ],
})
export class RoomGridEditorComponent {
  @Input({ required: true }) grid!: RoomGridState;
  @Input() cellSizePx = 16;
  @Output() setCell = new EventEmitter<{ cell: RoomGridCell; filled: boolean }>();

  private isDragging = false;
  private dragFill = true;
  private suppressClick = false;

  get gridTemplateColumns(): string {
    return `repeat(${this.grid.width}, var(--cell-size))`;
  }

  @HostListener('document:pointerup')
  onPointerUp(): void {
    this.isDragging = false;
  }

  handlePointerDown(cell: RoomGridCell, event: PointerEvent): void {
    event.preventDefault();
    this.suppressClick = true;
    this.isDragging = true;
    this.dragFill = !cell.filled;
    this.setCell.emit({ cell, filled: this.dragFill });
  }

  handlePointerEnter(cell: RoomGridCell): void {
    if (!this.isDragging) {
      return;
    }

    this.setCell.emit({ cell, filled: this.dragFill });
  }

  handleClick(cell: RoomGridCell): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }

    this.setCell.emit({ cell, filled: !cell.filled });
  }

  trackByIndex(index: number): number {
    return index;
  }
}

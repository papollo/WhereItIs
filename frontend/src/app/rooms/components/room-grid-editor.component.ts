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
        [style.--fill-color]="fillColor"
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
        background: var(--fill-color);
      }
    `,
  ],
})
export class RoomGridEditorComponent {
  @Input({ required: true }) grid!: RoomGridState;
  @Input() cellSizePx = 16;
  @Input() fillColor = '#212121';
  @Input() brushSize = 1;
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
    this.applyBrush(cell, this.dragFill);
  }

  handlePointerEnter(cell: RoomGridCell): void {
    if (!this.isDragging) {
      return;
    }

    this.applyBrush(cell, this.dragFill);
  }

  handleClick(cell: RoomGridCell): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }

    this.applyBrush(cell, !cell.filled);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private applyBrush(cell: RoomGridCell, filled: boolean): void {
    const size = this.normalizeBrushSize(this.brushSize);
    const radius = Math.floor(size / 2);

    for (let y = cell.y - radius; y <= cell.y + radius; y += 1) {
      for (let x = cell.x - radius; x <= cell.x + radius; x += 1) {
        const target = this.getCellAt(x, y);
        if (!target) {
          continue;
        }
        this.setCell.emit({ cell: target, filled });
      }
    }
  }

  private getCellAt(x: number, y: number): RoomGridCell | null {
    if (x < 0 || y < 0 || x >= this.grid.width || y >= this.grid.height) {
      return null;
    }

    const index = y * this.grid.width + x;
    return this.grid.cells[index] ?? null;
  }

  private normalizeBrushSize(size: number): number {
    if (size <= 1) {
      return 1;
    }
    if (size <= 3) {
      return 3;
    }
    return 5;
  }
}

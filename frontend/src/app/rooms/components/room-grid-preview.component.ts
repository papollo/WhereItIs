import { NgFor } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import type { RoomCellDto } from '../rooms.types';

@Component({
  selector: 'app-room-grid-preview',
  standalone: true,
  imports: [NgFor],
  template: `
    <div
      class="room-grid"
      [style.gridTemplateColumns]="gridTemplateColumns"
      [style.--cell-size.px]="cellSizePx"
      role="grid"
      aria-label="Siatka pokoju"
    >
      <div
        class="room-grid__cell"
        *ngFor="let cell of gridCells; trackBy: trackByIndex"
        [class.room-grid__cell--filled]="cell.filled"
      ></div>
    </div>
  `,
  styles: [
    `
      .room-grid {
        display: grid;
        gap: 2px;
        background: rgba(0, 0, 0, 0.08);
        padding: 8px;
        border-radius: 12px;
        width: fit-content;
        max-width: 100%;
        overflow: auto;
      }

      .room-grid__cell {
        width: var(--cell-size);
        height: var(--cell-size);
        background: #fff;
        border-radius: 2px;
      }

      .room-grid__cell--filled {
        background: #212121;
      }
    `,
  ],
})
export class RoomGridPreviewComponent implements OnChanges {
  @Input() cells: RoomCellDto[] = [];
  @Input() width?: number;
  @Input() height?: number;
  @Input() cellSizePx = 16;

  gridCells: Array<{ filled: boolean }> = [];
  gridTemplateColumns = '';

  ngOnChanges(): void {
    const { safeWidth, safeHeight } = this.getGridSize();
    const filled = new Set(this.cells.map((cell) => `${cell.x}:${cell.y}`));

    this.gridTemplateColumns = `repeat(${safeWidth}, var(--cell-size))`;
    this.gridCells = Array.from({ length: safeWidth * safeHeight }, (_, index) => {
      const x = safeWidth === 0 ? 0 : index % safeWidth;
      const y = safeWidth === 0 ? 0 : Math.floor(index / safeWidth);
      return { filled: filled.has(`${x}:${y}`) };
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private getGridSize(): { safeWidth: number; safeHeight: number } {
    const derivedWidth =
      this.width ?? (this.cells.length ? Math.max(...this.cells.map((cell) => cell.x)) + 1 : 0);
    const derivedHeight =
      this.height ?? (this.cells.length ? Math.max(...this.cells.map((cell) => cell.y)) + 1 : 0);

    return {
      safeWidth: Math.max(0, Math.floor(derivedWidth)),
      safeHeight: Math.max(0, Math.floor(derivedHeight)),
    };
  }
}

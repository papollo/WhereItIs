import { NgFor } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

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
      <div class="room-grid__cell" *ngFor="let cell of cells; trackBy: trackByIndex"></div>
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
    `,
  ],
})
export class RoomGridPreviewComponent implements OnChanges {
  @Input() width = 0;
  @Input() height = 0;
  @Input() cellSizePx = 16;

  cells: number[] = [];
  gridTemplateColumns = '';

  ngOnChanges(): void {
    const safeWidth = Math.max(0, Math.floor(this.width));
    const safeHeight = Math.max(0, Math.floor(this.height));

    this.gridTemplateColumns = `repeat(${safeWidth}, var(--cell-size))`;
    this.cells = Array.from({ length: safeWidth * safeHeight }, (_, index) => index);
  }

  trackByIndex(index: number): number {
    return index;
  }
}

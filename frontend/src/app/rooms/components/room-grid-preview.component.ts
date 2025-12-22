import { NgFor } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import type { RoomCellDto } from '../rooms.types';

export type RoomPlacementPreview = {
  furniture_id: string;
  x: number;
  y: number;
  width_cells: number;
  height_cells: number;
  color: string;
  name?: string;
};

@Component({
  selector: 'app-room-grid-preview',
  standalone: true,
  imports: [NgFor],
  template: `
    <div
      class="room-grid__wrap"
      [style.--cell-size.px]="cellSizePx"
      [style.--fill-color]="fillColor"
    >
      <div
        class="room-grid"
        [style.gridTemplateColumns]="gridTemplateColumns"
        [style.gridTemplateRows]="gridTemplateRows"
        role="grid"
        aria-label="Siatka pokoju"
      >
        <div
          class="room-grid__cell"
          *ngFor="let cell of gridCells; trackBy: trackByIndex"
          [class.room-grid__cell--filled]="cell.filled"
        ></div>
      </div>
      <div
        class="room-grid__overlay"
        [style.gridTemplateColumns]="gridTemplateColumns"
        [style.gridTemplateRows]="gridTemplateRows"
        aria-hidden="true"
      >
        <div
          class="room-grid__placement"
          *ngFor="let placement of placementCells; trackBy: trackByPlacementId"
          [style.gridColumn]="placement.gridColumn"
          [style.gridRow]="placement.gridRow"
          [style.--placement-color]="placement.color"
          [attr.title]="placement.name ?? ''"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .room-grid__wrap {
        position: relative;
        width: fit-content;
        max-width: 100%;
      }

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

      .room-grid__overlay {
        position: absolute;
        inset: 0;
        display: grid;
        gap: 2px;
        padding: 8px;
        pointer-events: none;
      }

      .room-grid__cell {
        width: var(--cell-size);
        height: var(--cell-size);
        background: #fff;
        border-radius: 2px;
      }

      .room-grid__cell--filled {
        background: var(--fill-color);
      }

      .room-grid__placement {
        background: var(--placement-color);
        border-radius: 4px;
        opacity: 0.6;
        border: 2px solid rgba(0, 0, 0, 0.35);
        box-sizing: border-box;
      }
    `,
  ],
})
export class RoomGridPreviewComponent implements OnChanges {
  @Input() cells: RoomCellDto[] = [];
  @Input() width?: number;
  @Input() height?: number;
  @Input() cellSizePx = 16;
  @Input() fillColor = '#212121';
  @Input() placements: RoomPlacementPreview[] = [];

  gridCells: Array<{ filled: boolean }> = [];
  gridTemplateColumns = '';
  gridTemplateRows = '';
  placementCells: Array<{
    furnitureId: string;
    gridColumn: string;
    gridRow: string;
    color: string;
    name?: string;
  }> = [];

  ngOnChanges(): void {
    const grid = this.getGridSpec();
    const filled = new Set(this.cells.map((cell) => `${cell.x}:${cell.y}`));

    this.gridTemplateColumns = `repeat(${grid.safeWidth}, var(--cell-size))`;
    this.gridTemplateRows = `repeat(${grid.safeHeight}, var(--cell-size))`;
    this.gridCells = Array.from({ length: grid.safeWidth * grid.safeHeight }, (_, index) => {
      const x = grid.safeWidth === 0 ? 0 : index % grid.safeWidth;
      const y = grid.safeWidth === 0 ? 0 : Math.floor(index / grid.safeWidth);
      const sourceX = x - grid.offsetX;
      const sourceY = y - grid.offsetY;
      return { filled: filled.has(`${sourceX}:${sourceY}`) };
    });

    this.placementCells = this.placements.map((placement) => {
      const colStart = placement.x + grid.offsetX + 1;
      const rowStart = placement.y + grid.offsetY + 1;
      return {
        furnitureId: placement.furniture_id,
        gridColumn: `${colStart} / span ${placement.width_cells}`,
        gridRow: `${rowStart} / span ${placement.height_cells}`,
        color: placement.color,
        name: placement.name,
      };
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByPlacementId(_: number, placement: { furnitureId: string }): string {
    return placement.furnitureId;
  }

  private getGridSpec(): { safeWidth: number; safeHeight: number; offsetX: number; offsetY: number } {
    const bounds = this.getBounds();
    if (!bounds) {
      const safeWidth = Math.max(0, Math.floor(this.width ?? 0));
      const safeHeight = Math.max(0, Math.floor(this.height ?? 0));
      return { safeWidth, safeHeight, offsetX: 0, offsetY: 0 };
    }

    const widthWithPadding = bounds.width + 4;
    const heightWithPadding = bounds.height + 4;

    return {
      safeWidth: Math.max(0, Math.floor(widthWithPadding)),
      safeHeight: Math.max(0, Math.floor(heightWithPadding)),
      offsetX: 2 - bounds.minX,
      offsetY: 2 - bounds.minY,
    };
  }

  private getBounds(): { minX: number; minY: number; width: number; height: number } | null {
    if (this.cells.length === 0) {
      return null;
    }

    const xs = this.cells.map((cell) => cell.x);
    const ys = this.cells.map((cell) => cell.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      minX,
      minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }
}

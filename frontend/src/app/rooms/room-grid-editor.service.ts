import { Injectable } from '@angular/core';

export type RoomGridCell = {
  x: number;
  y: number;
  filled: boolean;
  allowed: boolean;
};

export type RoomGridState = {
  width: number;
  height: number;
  cellSizeM: number;
  cells: RoomGridCell[];
  filled: Set<string>;
  allowed?: Set<string>;
};

export type GridBounds = {
  xStart: number;
  yStart: number;
  widthCells: number;
  heightCells: number;
};

@Injectable({
  providedIn: 'root',
})
export class RoomGridEditorService {
  private readonly cellSizeM = 0.5;

  createGrid(width = 40, height = 40, fillAll = false): RoomGridState {
    const safeWidth = Math.max(1, Math.min(width, 40));
    const safeHeight = Math.max(1, Math.min(height, 40));

    const filled = new Set<string>();
    const cells: RoomGridCell[] = [];

    for (let y = 0; y < safeHeight; y += 1) {
      for (let x = 0; x < safeWidth; x += 1) {
        const isFilled = fillAll;
        if (isFilled) {
          filled.add(this.key(x, y));
        }
        cells.push({ x, y, filled: isFilled, allowed: true });
      }
    }

    return {
      width: safeWidth,
      height: safeHeight,
      cellSizeM: this.cellSizeM,
      cells,
      filled,
    };
  }

  fillRectangle(state: RoomGridState, bounds: GridBounds): RoomGridState {
    for (let y = bounds.yStart; y < bounds.yStart + bounds.heightCells; y += 1) {
      for (let x = bounds.xStart; x < bounds.xStart + bounds.widthCells; x += 1) {
        const cell = state.cells.find((item) => item.x === x && item.y === y);
        if (!cell) {
          continue;
        }
        this.setCell(state, cell, true);
      }
    }

    return state;
  }

  applyCells(state: RoomGridState, cells: Array<{ x: number; y: number }>): RoomGridState {
    state.filled.clear();
    state.cells.forEach((cell) => {
      cell.filled = false;
    });

    cells.forEach((coord) => {
      const cell = state.cells.find((item) => item.x === coord.x && item.y === coord.y);
      if (!cell) {
        return;
      }
      this.setCell(state, cell, true);
    });

    return state;
  }

  getFilledCells(state: RoomGridState): Array<{ x: number; y: number }> {
    return Array.from(state.filled.values()).map((value) => {
      const [x, y] = value.split(':').map((part) => Number.parseInt(part, 10));
      return { x, y };
    });
  }

  setCell(state: RoomGridState, cell: RoomGridCell, filled: boolean): RoomGridState {
    const key = this.key(cell.x, cell.y);
    if (filled) {
      if (state.allowed && !state.allowed.has(key)) {
        return state;
      }
      if (!this.canFillCell(state, cell)) {
        return state;
      }
      state.filled.add(key);
      cell.filled = true;
      return state;
    }

    state.filled.delete(key);
    cell.filled = false;
    return state;
  }

  toggleCell(state: RoomGridState, cell: RoomGridCell): RoomGridState {
    if (!state.filled.has(this.key(cell.x, cell.y))) {
      if (!this.canFillCell(state, cell)) {
        return state;
      }

      return this.setCell(state, cell, true);
    }

    return this.setCell(state, cell, false);
  }

  getBounds(state: RoomGridState): GridBounds | null {
    if (state.filled.size === 0) {
      return null;
    }

    const coords = Array.from(state.filled.values()).map((value) => {
      const [x, y] = value.split(':').map((part) => Number.parseInt(part, 10));
      return { x, y };
    });

    const xs = coords.map((coord) => coord.x);
    const ys = coords.map((coord) => coord.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      xStart: minX,
      yStart: minY,
      widthCells: maxX - minX + 1,
      heightCells: maxY - minY + 1,
    };
  }

  canFillCell(state: RoomGridState, cell: RoomGridCell): boolean {
    if (state.allowed && !state.allowed.has(this.key(cell.x, cell.y))) {
      return false;
    }

    if (state.filled.size === 0) {
      return true;
    }

    return this.hasNeighbor(state, cell.x, cell.y);
  }

  private hasNeighbor(state: RoomGridState, x: number, y: number): boolean {
    const neighbors = [
      this.key(x - 1, y),
      this.key(x + 1, y),
      this.key(x, y - 1),
      this.key(x, y + 1),
    ];

    return neighbors.some((key) => state.filled.has(key));
  }

  private key(x: number, y: number): string {
    return `${x}:${y}`;
  }

  applyAllowedCells(state: RoomGridState, cells: Array<{ x: number; y: number }>): RoomGridState {
    const allowed = new Set(cells.map((cell) => this.key(cell.x, cell.y)));
    state.allowed = allowed;

    for (const key of Array.from(state.filled)) {
      if (!allowed.has(key)) {
        state.filled.delete(key);
      }
    }

    state.cells.forEach((cell) => {
      const key = this.key(cell.x, cell.y);
      cell.allowed = allowed.has(key);
      if (!cell.allowed) {
        cell.filled = false;
      }
    });

    return state;
  }
}

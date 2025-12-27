import { RoomGridEditorService } from './room-grid-editor.service';

describe('RoomGridEditorService', () => {
  let service: RoomGridEditorService;

  beforeEach(() => {
    service = new RoomGridEditorService();
  });

  it('clamps grid size and fills cells when fillAll is true', () => {
    const state = service.createGrid(0, 50, true);

    expect(state.width).toBe(1);
    expect(state.height).toBe(40);
    expect(state.cellSizeM).toBe(0.5);
    expect(state.cells.length).toBe(40);
    expect(state.filled.size).toBe(40);
    expect(state.cells.every((cell) => cell.filled)).toBeTrue();
  });

  it('clears previous fill when applying cells', () => {
    const state = service.createGrid(2, 2, true);

    service.applyCells(state, [{ x: 0, y: 1 }]);

    expect(state.filled.size).toBe(1);
    expect(state.filled.has('0:1')).toBeTrue();
    expect(state.cells.find((cell) => cell.x === 0 && cell.y === 1)?.filled).toBeTrue();
    expect(state.cells.find((cell) => cell.x === 1 && cell.y === 1)?.filled).toBeFalse();
  });

  it('prevents filling cells without neighbors once a cell is filled', () => {
    const state = service.createGrid(3, 3, false);
    const center = state.cells.find((cell) => cell.x === 1 && cell.y === 1);
    const corner = state.cells.find((cell) => cell.x === 0 && cell.y === 0);

    expect(center).toBeTruthy();
    expect(corner).toBeTruthy();

    service.setCell(state, center!, true);
    service.setCell(state, corner!, true);

    expect(state.filled.size).toBe(1);
    expect(state.filled.has('1:1')).toBeTrue();
    expect(state.filled.has('0:0')).toBeFalse();
    expect(corner!.filled).toBeFalse();
  });

  it('toggleCell respects neighbor rule for new cells', () => {
    const state = service.createGrid(3, 3, false);
    const center = state.cells.find((cell) => cell.x === 1 && cell.y === 1);
    const corner = state.cells.find((cell) => cell.x === 0 && cell.y === 0);

    service.setCell(state, center!, true);
    service.toggleCell(state, corner!);

    expect(state.filled.size).toBe(1);
    expect(state.filled.has('0:0')).toBeFalse();
  });

  it('returns correct bounds for filled cells', () => {
    const state = service.createGrid(4, 4, false);
    const cellA = state.cells.find((cell) => cell.x === 1 && cell.y === 2);
    const cellB = state.cells.find((cell) => cell.x === 2 && cell.y === 2);

    service.setCell(state, cellA!, true);
    service.setCell(state, cellB!, true);

    const bounds = service.getBounds(state);

    expect(bounds).toEqual({ xStart: 1, yStart: 2, widthCells: 2, heightCells: 1 });
  });

  it('applies allowed cells and clears disallowed filled cells', () => {
    const state = service.createGrid(2, 2, false);
    const cellA = state.cells.find((cell) => cell.x === 0 && cell.y === 0);
    const cellB = state.cells.find((cell) => cell.x === 1 && cell.y === 1);

    service.setCell(state, cellA!, true);
    service.setCell(state, cellB!, true);

    service.applyAllowedCells(state, [{ x: 0, y: 0 }]);

    expect(state.filled.size).toBe(1);
    expect(state.filled.has('0:0')).toBeTrue();
    expect(state.filled.has('1:1')).toBeFalse();
    expect(cellA!.allowed).toBeTrue();
    expect(cellB!.allowed).toBeFalse();
    expect(cellB!.filled).toBeFalse();
  });
});

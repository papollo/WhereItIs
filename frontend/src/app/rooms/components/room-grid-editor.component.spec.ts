import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { RoomGridEditorComponent } from './room-grid-editor.component';
import type { RoomGridState } from '../room-grid-editor.service';

const createGrid = (width: number, height: number): RoomGridState => {
  const cells = Array.from({ length: width * height }, (_, index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    return { x, y, filled: false, allowed: true };
  });

  return {
    width,
    height,
    cellSizeM: 0.5,
    cells,
    filled: new Set<string>(),
  };
};

describe('RoomGridEditorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGridEditorComponent],
    }).compileComponents();
  });

  it('emits correct cell count for brush sizes 1, 3, 5', () => {
    const fixture = TestBed.createComponent(RoomGridEditorComponent);
    const component = fixture.componentInstance;
    component.grid = createGrid(5, 5);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button.grid-editor__cell'));
    const center = buttons[2 + 2 * 5];
    const emitSpy = spyOn(component.setCell, 'emit');

    component.brushSize = 1;
    center.triggerEventHandler('click', {});
    expect(emitSpy.calls.count()).toBe(1);

    emitSpy.calls.reset();
    component.brushSize = 3;
    center.triggerEventHandler('click', {});
    expect(emitSpy.calls.count()).toBe(9);

    emitSpy.calls.reset();
    component.brushSize = 5;
    center.triggerEventHandler('click', {});
    expect(emitSpy.calls.count()).toBe(25);
  });

  it('emits on drag and suppresses click after drag', () => {
    const fixture = TestBed.createComponent(RoomGridEditorComponent);
    const component = fixture.componentInstance;
    component.grid = createGrid(3, 3);
    component.brushSize = 1;
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button.grid-editor__cell'));
    const first = buttons[0];
    const second = buttons[1];
    const emitSpy = spyOn(component.setCell, 'emit');

    const pointerEvent = { preventDefault: () => {} };
    first.triggerEventHandler('pointerdown', pointerEvent);
    second.triggerEventHandler('pointerenter', {});
    second.triggerEventHandler('click', {});

    expect(emitSpy.calls.count()).toBe(2);
  });
});

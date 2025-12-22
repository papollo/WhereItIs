import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export type ColorOption = {
  value: string;
  label?: string;
};

@Component({
  selector: 'app-room-color-picker',
  standalone: true,
  imports: [MatButtonModule, NgFor],
  template: `
    <div class="color-picker">
      <button
        *ngFor="let color of colors; trackBy: trackByColor"
        mat-icon-button
        type="button"
        class="color-picker__swatch"
        [class.color-picker__swatch--active]="color.value === value"
        [style.backgroundColor]="color.value"
        (click)="selectColor(color.value)"
        [attr.aria-label]="color.label ?? color.value"
      ></button>
    </div>
  `,
  styles: [
    `
      .color-picker {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
        gap: 8px;
      }

      .color-picker__swatch {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid transparent;
      }

      .color-picker__swatch--active {
        border-color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class RoomColorPickerComponent {
  @Input() colors: ColorOption[] = [];
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  selectColor(color: string): void {
    this.valueChange.emit(color);
  }

  trackByColor(index: number, color: ColorOption): string {
    return color.value;
  }
}

import { NgFor, NgIf } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RoomGridEditorComponent } from '../../rooms/components/room-grid-editor.component';
import {
  RoomGridEditorService,
  type RoomGridCell,
  type RoomGridState,
} from '../../rooms/room-grid-editor.service';
import type { RoomCellDto } from '../../rooms/rooms.types';
import type { FurniturePlacementUpsertRequest } from '../furniture.types';

export type FurnitureFormValue = {
  name: string;
  description: string;
  color: string;
};

export type FurnitureFormResult = FurnitureFormValue & {
  placement?: FurniturePlacementUpsertRequest;
};

export type FurnitureFormDialogData = {
  title: string;
  submitLabel: string;
  value?: FurnitureFormValue;
  roomId?: string;
  roomCells?: RoomCellDto[];
  placement?: FurniturePlacementUpsertRequest;
};

@Component({
  selector: 'app-furniture-form-dialog',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RoomGridEditorComponent,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" mat-dialog-content>
      <mat-form-field appearance="outline" class="field">
        <mat-label>Nazwa mebla</mat-label>
        <input matInput formControlName="name" maxlength="150" />
        <mat-error *ngIf="form.controls.name.hasError('required')">Nazwa jest wymagana.</mat-error>
        <mat-error *ngIf="form.controls.name.hasError('maxlength')">
          Maksymalnie 150 znakow.
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="field">
        <mat-label>Opis</mat-label>
        <textarea matInput rows="3" formControlName="description" maxlength="500"></textarea>
        <mat-hint align="end">{{ form.controls.description.value.length }}/500</mat-hint>
      </mat-form-field>

      <section class="color-picker">
        <div class="color-picker__label">Kolor</div>
        <div class="color-picker__swatches">
          <button
            *ngFor="let color of palette; trackBy: trackByColor"
            type="button"
            class="color-picker__swatch"
            [style.backgroundColor]="color"
            [class.color-picker__swatch--selected]="form.controls.color.value === color"
            (click)="selectColor(color)"
            [attr.aria-label]="'Kolor ' + color"
          ></button>
        </div>
        <p class="color-picker__error" *ngIf="form.controls.color.hasError('required')">
          Kolor jest wymagany.
        </p>
      </section>

      <section class="placement" *ngIf="gridState">
        <h3>Ustawienie mebla</h3>
        <p class="placement__hint">Zaznacz obszar, na ktorym ma stanac mebel.</p>
        <app-room-grid-editor
          [grid]="gridState"
          [fillColor]="form.controls.color.value"
          [brushSize]="1"
          (setCell)="setCell($event)"
        ></app-room-grid-editor>
        <p class="placement__error" *ngIf="placementError">{{ placementError }}</p>
      </section>
    </form>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Anuluj</button>
      <button mat-flat-button color="primary" type="button" [disabled]="form.invalid" (click)="submit()">
        {{ data.submitLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .field {
        width: 100%;
      }

      form {
        display: grid;
        gap: 12px;
        min-width: 320px;
      }

      .placement {
        display: grid;
        gap: 12px;
        margin-top: 8px;
        padding: 12px;
        border-radius: 12px;
        background: #f7f7f7;
      }

      .placement h3 {
        margin: 0;
      }

      .placement__hint {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
      }

      .placement__error {
        margin: 0;
        padding: 10px 12px;
        border-radius: 12px;
        background: #fff4f4;
        color: #8a2f2f;
        border: 1px solid #f2c6c6;
      }

      .color-picker {
        display: grid;
        gap: 8px;
      }

      .color-picker__label {
        font-weight: 500;
      }

      .color-picker__swatches {
        display: grid;
        grid-template-columns: repeat(5, 36px);
        gap: 8px;
      }

      .color-picker__swatch {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 2px solid transparent;
        cursor: pointer;
      }

      .color-picker__swatch--selected {
        border-color: rgba(0, 0, 0, 0.7);
      }

      .color-picker__error {
        margin: 0;
        font-size: 0.85rem;
        color: #8a2f2f;
      }
    `,
  ],
})
export class FurnitureFormDialogComponent {
  private readonly gridService = inject(RoomGridEditorService);

  readonly form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    color: FormControl<string>;
  }>;

  readonly palette = [
    '#ff1744',
    '#ff6d00',
    '#ffea00',
    '#00c853',
    '#00bfa5',
    '#00b0ff',
    '#2962ff',
    '#651fff',
    '#c51162',
    '#4e342e',
  ];

  gridState: RoomGridState | null = null;
  placementError: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: FurnitureFormDialogData,
    private readonly dialogRef: MatDialogRef<FurnitureFormDialogComponent, FurnitureFormResult>
  ) {
    const initialColor = this.normalizeColor(this.data.value?.color);
    this.form = new FormGroup({
      name: new FormControl(this.data.value?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      description: new FormControl(this.data.value?.description ?? '', {
        nonNullable: true,
        validators: [Validators.maxLength(500)],
      }),
      color: new FormControl(initialColor, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });

    if (this.data.roomCells && this.data.roomCells.length > 0) {
      const grid = this.gridService.createGrid(40, 40, false);
      this.gridState = this.gridService.applyAllowedCells(grid, this.data.roomCells);
      if (this.data.placement) {
        this.gridService.fillRectangle(this.gridState, {
          xStart: this.data.placement.x,
          yStart: this.data.placement.y,
          widthCells: this.data.placement.width_cells,
          heightCells: this.data.placement.height_cells,
        });
      }
    }
  }

  setCell(payload: { cell: RoomGridCell; filled: boolean }): void {
    if (!this.gridState) {
      return;
    }
    const { cell, filled } = payload;
    this.gridState = this.gridService.setCell(this.gridState, cell, filled);
  }

  submit(): void {
    this.placementError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.gridState) {
      const bounds = this.gridService.getBounds(this.gridState);
      if (!bounds || !this.data.roomId) {
        this.placementError = 'Wybierz miejsce dla mebla.';
        return;
      }

      this.dialogRef.close({
        ...value,
        placement: {
          room_id: this.data.roomId,
          x: bounds.xStart,
          y: bounds.yStart,
          width_cells: bounds.widthCells,
          height_cells: bounds.heightCells,
        },
      });
      return;
    }

    this.dialogRef.close(value);
  }

  selectColor(color: string): void {
    this.form.controls.color.setValue(color);
  }

  trackByColor(_: number, color: string): string {
    return color;
  }

  private normalizeColor(color?: string): string {
    if (color && this.palette.includes(color)) {
      return color;
    }
    return this.palette[0];
  }
}

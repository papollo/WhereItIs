import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RoomColorPickerComponent, type ColorOption } from './room-color-picker.component';

export type RoomFormValue = {
  name: string;
  color: string;
};

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, RoomColorPickerComponent, NgIf],
  template: `
    <form [formGroup]="form" class="room-form">
      <mat-form-field appearance="outline">
        <mat-label>Nazwa pokoju</mat-label>
        <input matInput formControlName="name" maxlength="100" />
        <mat-error *ngIf="form.controls.name.hasError('required')">Nazwa jest wymagana.</mat-error>
        <mat-error *ngIf="form.controls.name.hasError('maxlength')">
          Maksymalnie 100 znakow.
        </mat-error>
      </mat-form-field>

      <div class="room-form__colors">
        <label>Kolor pokoju</label>
        <app-room-color-picker
          [colors]="palette"
          [value]="form.controls.color.value"
          (valueChange)="onColorSelect($event)"
        ></app-room-color-picker>
        <mat-form-field appearance="outline">
          <mat-label>HEX</mat-label>
          <input matInput formControlName="color" maxlength="7" />
          <mat-error *ngIf="form.controls.color.hasError('pattern')">
            Podaj poprawny kolor, np. #aabbcc.
          </mat-error>
          <mat-error *ngIf="form.controls.color.hasError('required')">
            Kolor jest wymagany.
          </mat-error>
        </mat-form-field>
      </div>
    </form>
  `,
  styles: [
    `
      .room-form {
        display: grid;
        gap: 16px;
      }

      .room-form__colors {
        display: grid;
        gap: 12px;
      }
    `,
  ],
})
export class RoomFormComponent {
  @Input() set value(value: RoomFormValue) {
    this.form.setValue(value, { emitEvent: false });
  }

  @Output() valueChange = new EventEmitter<RoomFormValue>();

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    color: new FormControl('#aabbcc', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)],
    }),
  });

  readonly palette: ColorOption[] = [
    { value: '#f44336' },
    { value: '#e91e63' },
    { value: '#9c27b0' },
    { value: '#673ab7' },
    { value: '#3f51b5' },
    { value: '#2196f3' },
    { value: '#03a9f4' },
    { value: '#00bcd4' },
    { value: '#009688' },
    { value: '#4caf50' },
    { value: '#8bc34a' },
    { value: '#cddc39' },
    { value: '#ffeb3b' },
    { value: '#ffc107' },
    { value: '#ff9800' },
    { value: '#ff5722' },
    { value: '#795548' },
    { value: '#9e9e9e' },
    { value: '#607d8b' },
    { value: '#263238' },
  ];

  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.form.valueChanges.subscribe(() => {
      this.valueChange.emit(this.form.getRawValue());
    });
  }

  onColorSelect(color: string): void {
    this.form.controls.color.setValue(color);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

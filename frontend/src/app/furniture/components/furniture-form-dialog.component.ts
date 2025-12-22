import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type FurnitureFormValue = {
  name: string;
  description: string;
  color: string;
};

export type FurnitureFormDialogData = {
  title: string;
  submitLabel: string;
  value?: FurnitureFormValue;
};

@Component({
  selector: 'app-furniture-form-dialog',
  standalone: true,
  imports: [
    NgIf,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
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
        <textarea matInput rows="3" formControlName="description" maxlength="300"></textarea>
        <mat-hint align="end">{{ form.controls.description.value.length }}/300</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="outline" class="field">
        <mat-label>Kolor</mat-label>
        <input matInput formControlName="color" maxlength="7" />
        <mat-hint>#RRGGBB</mat-hint>
        <mat-error *ngIf="form.controls.color.hasError('pattern')">
          Podaj poprawny kolor, np. #aabbcc.
        </mat-error>
        <mat-error *ngIf="form.controls.color.hasError('required')">
          Kolor jest wymagany.
        </mat-error>
      </mat-form-field>
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
    `,
  ],
})
export class FurnitureFormDialogComponent {
  readonly form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    color: FormControl<string>;
  }>;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: FurnitureFormDialogData,
    private readonly dialogRef: MatDialogRef<FurnitureFormDialogComponent, FurnitureFormValue>
  ) {
    this.form = new FormGroup({
      name: new FormControl(this.data.value?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      description: new FormControl(this.data.value?.description ?? '', {
        nonNullable: true,
        validators: [Validators.maxLength(300)],
      }),
      color: new FormControl(this.data.value?.color ?? '#aabbcc', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)],
      }),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close(value);
  }
}

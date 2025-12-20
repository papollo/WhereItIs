import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError } from './shared/api-error';
import { RoomsApi } from './rooms/rooms.api';
import type { CreateRoomCommand, RoomDto } from './rooms/rooms.types';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly roomsApi = inject(RoomsApi);

  readonly form = new FormGroup({
    name: new FormControl('Kitchen', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    color: new FormControl('#aabbcc', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)],
    }),
    x_start: new FormControl('0', { nonNullable: true, validators: [Validators.required] }),
    y_start: new FormControl('0', { nonNullable: true, validators: [Validators.required] }),
    width_cells: new FormControl('40', { nonNullable: true, validators: [Validators.required] }),
    height_cells: new FormControl('40', { nonNullable: true, validators: [Validators.required] }),
    cell_size_m: new FormControl('0.5', { nonNullable: true, validators: [Validators.required] }),
  });

  isSubmitting = false;
  result: RoomDto | null = null;
  errorText: string | null = null;

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    this.result = null;
    this.errorText = null;

    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    const command: CreateRoomCommand = {
      name: raw.name,
      color: raw.color,
      x_start: Number.parseFloat(raw.x_start),
      y_start: Number.parseFloat(raw.y_start),
      width_cells: Number.parseInt(raw.width_cells, 10),
      height_cells: Number.parseInt(raw.height_cells, 10),
      cell_size_m: Number.parseFloat(raw.cell_size_m),
    };

    this.isSubmitting = true;
    try {
      this.result = await this.roomsApi.createRoom(command);
    } catch (err: unknown) {
      this.errorText = this.formatError(err);
    } finally {
      this.isSubmitting = false;
    }
  }

  private formatError(err: unknown): string {
    if (err instanceof ApiError) {
      return JSON.stringify(
        {
          name: err.name,
          status: err.status,
          code: err.code,
          message: err.message,
          details: err.details,
        },
        null,
        2
      );
    }

    if (err instanceof Error) {
      return err.stack ?? err.message;
    }

    return 'Unknown error';
  }
}

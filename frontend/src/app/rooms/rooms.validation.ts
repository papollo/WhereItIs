import type { CreateRoomCommand } from './rooms.types';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

type CreateRoomField = keyof CreateRoomCommand;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

export function validateCreateRoomCommand(command: CreateRoomCommand): Record<string, string> | null {
  const errors: Partial<Record<CreateRoomField, string>> = {};

  const trimmedName = command.name.trim();
  if (trimmedName.length === 0) {
    errors.name = 'Name is required';
  } else if (trimmedName.length > 120) {
    errors.name = 'Name must be at most 120 characters';
  }

  if (!HEX_COLOR_RE.test(command.color)) {
    errors.color = 'Color must be a hex value like #aabbcc';
  }

  if (!isFiniteNumber(command.x_start) || command.x_start < 0) {
    errors.x_start = 'x_start must be a number >= 0';
  }

  if (!isFiniteNumber(command.y_start) || command.y_start < 0) {
    errors.y_start = 'y_start must be a number >= 0';
  }

  if (!isInteger(command.width_cells) || command.width_cells < 1 || command.width_cells > 50) {
    errors.width_cells = 'width_cells must be an integer between 1 and 50';
  }

  if (!isInteger(command.height_cells) || command.height_cells < 1 || command.height_cells > 50) {
    errors.height_cells = 'height_cells must be an integer between 1 and 50';
  }

  if (!isFiniteNumber(command.cell_size_m) || command.cell_size_m !== 0.5) {
    errors.cell_size_m = 'cell_size_m must be exactly 0.5';
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

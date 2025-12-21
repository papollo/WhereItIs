import type { CreateRoomCommand, ListRoomsQuery, UpdateRoomCommand } from './rooms.types';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

type CreateRoomField = keyof CreateRoomCommand;
type ListRoomsField = keyof ListRoomsQuery;
type UpdateRoomField = keyof UpdateRoomCommand;

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

export function validateListRoomsQuery(query: ListRoomsQuery): Record<string, string> | null {
  const errors: Partial<Record<ListRoomsField, string>> = {};

  if (typeof query.name === 'string') {
    const trimmedName = query.name.trim();
    if (trimmedName.length === 0) {
      errors.name = 'Name filter cannot be empty';
    } else if (trimmedName.length > 120) {
      errors.name = 'Name filter must be at most 120 characters';
    }
  }

  if (query.limit !== undefined) {
    if (!isInteger(query.limit) || query.limit < 1 || query.limit > 200) {
      errors.limit = 'limit must be an integer between 1 and 200';
    }
  }

  if (query.offset !== undefined) {
    if (!isInteger(query.offset) || query.offset < 0) {
      errors.offset = 'offset must be an integer >= 0';
    } else if (query.limit === undefined) {
      errors.offset = 'offset requires limit to be set';
    }
  }

  if (query.orderBy !== undefined && query.orderBy !== 'created_at' && query.orderBy !== 'name') {
    errors.orderBy = 'orderBy must be one of: created_at, name';
  }

  if (
    query.orderDirection !== undefined &&
    query.orderDirection !== 'asc' &&
    query.orderDirection !== 'desc'
  ) {
    errors.orderDirection = 'orderDirection must be one of: asc, desc';
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

export function validateUpdateRoomCommand(command: UpdateRoomCommand): Record<string, string> | null {
  const errors: Partial<Record<UpdateRoomField, string>> = {};

  if (command.name !== undefined) {
    const trimmedName = command.name.trim();
    if (trimmedName.length === 0) {
      errors.name = 'Name is required';
    } else if (trimmedName.length > 120) {
      errors.name = 'Name must be at most 120 characters';
    }
  }

  if (command.color !== undefined && !HEX_COLOR_RE.test(command.color)) {
    errors.color = 'Color must be a hex value like #aabbcc';
  }

  if (command.x_start !== undefined && (!isFiniteNumber(command.x_start) || command.x_start < 0)) {
    errors.x_start = 'x_start must be a number >= 0';
  }

  if (command.y_start !== undefined && (!isFiniteNumber(command.y_start) || command.y_start < 0)) {
    errors.y_start = 'y_start must be a number >= 0';
  }

  if (
    command.width_cells !== undefined &&
    (!isInteger(command.width_cells) || command.width_cells < 1 || command.width_cells > 50)
  ) {
    errors.width_cells = 'width_cells must be an integer between 1 and 50';
  }

  if (
    command.height_cells !== undefined &&
    (!isInteger(command.height_cells) || command.height_cells < 1 || command.height_cells > 50)
  ) {
    errors.height_cells = 'height_cells must be an integer between 1 and 50';
  }

  if (
    command.cell_size_m !== undefined &&
    (!isFiniteNumber(command.cell_size_m) || command.cell_size_m !== 0.5)
  ) {
    errors.cell_size_m = 'cell_size_m must be exactly 0.5';
  }

  if (
    command.name === undefined &&
    command.color === undefined &&
    command.x_start === undefined &&
    command.y_start === undefined &&
    command.width_cells === undefined &&
    command.height_cells === undefined &&
    command.cell_size_m === undefined
  ) {
    errors.name = 'At least one field must be provided';
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

export function validateRoomId(roomId: string): Record<string, string> | null {
  if (roomId.trim().length === 0) {
    return { roomId: 'Room id is required' };
  }

  return null;
}

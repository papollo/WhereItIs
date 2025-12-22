import type { CreateRoomCommand, ListRoomsQuery, UpdateRoomCommand } from './rooms.types';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

type CreateRoomField = keyof CreateRoomCommand;
type ListRoomsField = keyof ListRoomsQuery;
type UpdateRoomField = keyof UpdateRoomCommand;

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

  if (query.sort !== undefined && query.sort !== 'created_at' && query.sort !== 'name') {
    errors.sort = 'sort must be one of: created_at, name';
  }

  if (
    query.orderDirection !== undefined &&
    query.orderDirection !== 'asc' &&
    query.orderDirection !== 'desc'
  ) {
    errors.orderDirection = 'orderDirection must be one of: asc, desc';
  }

  if (query.order !== undefined && query.order !== 'asc' && query.order !== 'desc') {
    errors.order = 'order must be one of: asc, desc';
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

  if (command.name === undefined && command.color === undefined) {
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

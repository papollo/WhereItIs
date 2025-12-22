import type { CreateFurnitureCommand, ListFurnitureQuery, UpdateFurnitureCommand } from './furniture.types';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const MAX_NAME_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 300;

type CreateFurnitureField = keyof CreateFurnitureCommand;
type ListFurnitureField = keyof ListFurnitureQuery;
type UpdateFurnitureField = keyof UpdateFurnitureCommand;

export function validateCreateFurnitureCommand(
  command: CreateFurnitureCommand
): Record<string, string> | null {
  const errors: Partial<Record<CreateFurnitureField, string>> = {};

  const trimmedName = command.name.trim();
  if (trimmedName.length === 0) {
    errors.name = 'Name is required';
  } else if (trimmedName.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be at most ${MAX_NAME_LENGTH} characters`;
  }

  if (command.description !== null && command.description !== undefined) {
    if (command.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`;
    }
  }

  if (!HEX_COLOR_RE.test(command.color)) {
    errors.color = 'Color must be a hex value like #aabbcc';
  }

  if (command.room_id.trim().length === 0) {
    errors.room_id = 'Room id is required';
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

export function validateUpdateFurnitureCommand(
  command: UpdateFurnitureCommand
): Record<string, string> | null {
  const errors: Partial<Record<UpdateFurnitureField, string>> = {};

  if (command.name !== undefined) {
    const trimmedName = command.name.trim();
    if (trimmedName.length === 0) {
      errors.name = 'Name is required';
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      errors.name = `Name must be at most ${MAX_NAME_LENGTH} characters`;
    }
  }

  if (command.description !== undefined) {
    if (command.description !== null && command.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`;
    }
  }

  if (command.color !== undefined && !HEX_COLOR_RE.test(command.color)) {
    errors.color = 'Color must be a hex value like #aabbcc';
  }

  if (Object.keys(command).length === 0) {
    errors.name = 'At least one field must be provided';
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

export function validateListFurnitureQuery(
  query: ListFurnitureQuery
): Record<string, string> | null {
  const errors: Partial<Record<ListFurnitureField, string>> = {};

  if (query.roomId.trim().length === 0) {
    errors.roomId = 'Room id is required';
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

export function validateFurnitureId(furnitureId: string): Record<string, string> | null {
  if (furnitureId.trim().length === 0) {
    return { furnitureId: 'Furniture id is required' };
  }

  return null;
}

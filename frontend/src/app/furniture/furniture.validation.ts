import type {
  CreateFurnitureCommand,
  FurniturePlacementUpsertRequest,
  ListFurnitureQuery,
  UpdateFurnitureCommand,
} from './furniture.types';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const MAX_NAME_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 500;

type CreateFurnitureField = keyof CreateFurnitureCommand;
type FurniturePlacementField = keyof FurniturePlacementUpsertRequest;
type ListFurnitureField = keyof ListFurnitureQuery;
type UpdateFurnitureField = keyof UpdateFurnitureCommand;

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

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

  if (typeof query.name === 'string') {
    const trimmedName = query.name.trim();
    if (trimmedName.length === 0) {
      errors.name = 'Name filter cannot be empty';
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      errors.name = `Name filter must be at most ${MAX_NAME_LENGTH} characters`;
    }
  }

  if (query.limit !== undefined) {
    if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 200) {
      errors.limit = 'limit must be an integer between 1 and 200';
    }
  }

  if (query.offset !== undefined) {
    if (!Number.isInteger(query.offset) || query.offset < 0) {
      errors.offset = 'offset must be an integer >= 0';
    } else if (query.limit === undefined) {
      errors.offset = 'offset requires limit to be set';
    }
  }

  if (query.sort !== undefined && query.sort !== 'created_at' && query.sort !== 'name') {
    errors.sort = 'sort must be one of: created_at, name';
  }

  if (query.order !== undefined && query.order !== 'asc' && query.order !== 'desc') {
    errors.order = 'order must be one of: asc, desc';
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

export function validateFurniturePlacementRequest(
  request: FurniturePlacementUpsertRequest
): Record<string, string> | null {
  const errors: Partial<Record<FurniturePlacementField, string>> = {};

  if (request.room_id.trim().length === 0) {
    errors.room_id = 'Room id is required';
  }

  if (!isInteger(request.x) || request.x < 0 || request.x > 49) {
    errors.x = 'x must be an integer between 0 and 49';
  }

  if (!isInteger(request.y) || request.y < 0 || request.y > 49) {
    errors.y = 'y must be an integer between 0 and 49';
  }

  if (!isInteger(request.width_cells) || request.width_cells < 1 || request.width_cells > 50) {
    errors.width_cells = 'width_cells must be an integer between 1 and 50';
  }

  if (!isInteger(request.height_cells) || request.height_cells < 1 || request.height_cells > 50) {
    errors.height_cells = 'height_cells must be an integer between 1 and 50';
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

import type {
  ItemCreateRequest,
  ItemRenameRequest,
  ListFurnitureItemsQuery,
} from './items.types';

const MAX_NAME_LENGTH = 200;

type CreateItemField = `items.${number}.name` | 'items';
type ListItemsField = keyof ListFurnitureItemsQuery;
type RenameItemField = keyof ItemRenameRequest;

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

export function validateFurnitureId(furnitureId: string): Record<string, string> | null {
  if (furnitureId.trim().length === 0) {
    return { furnitureId: 'Furniture id is required' };
  }

  return null;
}

export function validateItemId(itemId: string): Record<string, string> | null {
  if (itemId.trim().length === 0) {
    return { itemId: 'Item id is required' };
  }

  return null;
}

export function validateListFurnitureItemsQuery(
  query: ListFurnitureItemsQuery
): Record<string, string> | null {
  const errors: Partial<Record<ListItemsField, string>> = {};

  if (query.furnitureId.trim().length === 0) {
    errors.furnitureId = 'Furniture id is required';
  }

  if (typeof query.q === 'string') {
    const trimmed = query.q.trim();
    if (trimmed.length === 0) {
      errors.q = 'Query filter cannot be empty';
    } else if (trimmed.length > MAX_NAME_LENGTH) {
      errors.q = `Query filter must be at most ${MAX_NAME_LENGTH} characters`;
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

export function validateCreateItemsRequest(request: ItemCreateRequest): Record<string, string> | null {
  const errors: Partial<Record<CreateItemField, string>> = {};

  if (!Array.isArray(request.items) || request.items.length === 0) {
    errors.items = 'At least one item is required';
    return errors as Record<string, string>;
  }

  request.items.forEach((item, index) => {
    const trimmed = item.name.trim();
    if (trimmed.length === 0) {
      errors[`items.${index}.name`] = 'Name is required';
    } else if (trimmed.length > MAX_NAME_LENGTH) {
      errors[`items.${index}.name`] = `Name must be at most ${MAX_NAME_LENGTH} characters`;
    }
  });

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

export function validateRenameItemRequest(
  request: ItemRenameRequest
): Record<string, string> | null {
  const errors: Partial<Record<RenameItemField, string>> = {};
  const trimmed = request.name.trim();

  if (trimmed.length === 0) {
    errors.name = 'Name is required';
  } else if (trimmed.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be at most ${MAX_NAME_LENGTH} characters`;
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

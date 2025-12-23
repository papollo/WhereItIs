import type { SearchItemsQuery } from './search.types';

type SearchField = keyof SearchItemsQuery;

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

export function validateSearchItemsQuery(query: SearchItemsQuery): Record<string, string> | null {
  const errors: Partial<Record<SearchField, string>> = {};

  const trimmed = query.q.trim();
  if (trimmed.length === 0) {
    errors.q = 'Query is required';
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

  if (
    query.sort !== undefined &&
    query.sort !== 'relevance' &&
    query.sort !== 'name' &&
    query.sort !== 'created_at'
  ) {
    errors.sort = 'sort must be one of: relevance, name, created_at';
  }

  if (query.order !== undefined && query.order !== 'asc' && query.order !== 'desc') {
    errors.order = 'order must be one of: asc, desc';
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<string, string>;
}

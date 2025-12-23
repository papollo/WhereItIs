import type { PostgrestError } from '@supabase/postgrest-js';
import { ApiError } from '../shared/api-error';

export function mapSearchItemsPostgrestError(error: PostgrestError, status?: number): ApiError {
  if (status === 401) {
    return ApiError.unauthorized(error.message);
  }

  if (status === 400 || error.code === '22P02') {
    return ApiError.badRequest(error.message, undefined, error);
  }

  return new ApiError({
    status: status ?? 500,
    code: 'SUPABASE_ERROR',
    message: error.message,
    cause: error,
  });
}

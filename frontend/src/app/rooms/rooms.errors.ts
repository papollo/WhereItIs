import type { PostgrestError } from '@supabase/postgrest-js';
import { ApiError } from '../shared/api-error';

const NOT_FOUND_STATUS = 404;
const NO_ROWS_STATUS = 406;
const NO_ROWS_CODE = 'PGRST116';

function isNotFoundError(error: PostgrestError, status?: number): boolean {
  return status === NOT_FOUND_STATUS || status === NO_ROWS_STATUS || error.code === NO_ROWS_CODE;
}

export function mapCreateRoomPostgrestError(error: PostgrestError, status?: number): ApiError {
  if (status === 401) {
    return ApiError.unauthorized(error.message);
  }

  if (error.code === '23505') {
    return ApiError.conflict('Room name already exists', undefined, error);
  }

  if (error.code === '23514' || error.code === '23502') {
    return ApiError.constraint(error.message, undefined, error);
  }

  if (error.code === '22P02') {
    return ApiError.badRequest(error.message, undefined, error);
  }

  return new ApiError({
    status: status ?? 500,
    code: 'SUPABASE_ERROR',
    message: error.message,
    cause: error,
  });
}

export function mapListRoomsPostgrestError(error: PostgrestError, status?: number): ApiError {
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

export function mapGetRoomPostgrestError(error: PostgrestError, status?: number): ApiError {
  if (status === 401) {
    return ApiError.unauthorized(error.message);
  }

  if (isNotFoundError(error, status)) {
    return ApiError.notFound('Room not found');
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

export function mapUpdateRoomPostgrestError(error: PostgrestError, status?: number): ApiError {
  if (status === 401) {
    return ApiError.unauthorized(error.message);
  }

  if (isNotFoundError(error, status)) {
    return ApiError.notFound('Room not found');
  }

  if (error.code === '23505') {
    return ApiError.conflict('Room name already exists', undefined, error);
  }

  if (error.code === '23514' || error.code === '23502') {
    return ApiError.constraint(error.message, undefined, error);
  }

  if (error.code === '22P02') {
    return ApiError.badRequest(error.message, undefined, error);
  }

  return new ApiError({
    status: status ?? 500,
    code: 'SUPABASE_ERROR',
    message: error.message,
    cause: error,
  });
}

export function mapDeleteRoomPostgrestError(error: PostgrestError, status?: number): ApiError {
  if (status === 401) {
    return ApiError.unauthorized(error.message);
  }

  if (isNotFoundError(error, status)) {
    return ApiError.notFound('Room not found');
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

export function mapRoomCellsPostgrestError(error: PostgrestError, status?: number): ApiError {
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

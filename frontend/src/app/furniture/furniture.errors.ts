import type { PostgrestError } from '@supabase/postgrest-js';
import { ApiError } from '../shared/api-error';

export function mapCreateFurniturePostgrestError(error: PostgrestError, status?: number): ApiError {
  if (status === 401) {
    return ApiError.unauthorized(error.message);
  }

  if (error.code === '23505') {
    return ApiError.conflict('Furniture name already exists', undefined, error);
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

export function mapListFurniturePostgrestError(error: PostgrestError, status?: number): ApiError {
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

export function mapUpdateFurniturePostgrestError(error: PostgrestError, status?: number): ApiError {
  if (status === 401) {
    return ApiError.unauthorized(error.message);
  }

  if (error.code === '23505') {
    return ApiError.conflict('Furniture name already exists', undefined, error);
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

export function mapDeleteFurniturePostgrestError(error: PostgrestError, status?: number): ApiError {
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

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'ROOM_NAME_CONFLICT'
  | 'DB_CONSTRAINT_VIOLATION'
  | 'SUPABASE_ERROR';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: Record<string, string>;

  constructor(params: {
    status: number;
    code: ApiErrorCode;
    message: string;
    details?: Record<string, string>;
    cause?: unknown;
  }) {
    super(params.message, params.cause ? { cause: params.cause } : undefined);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError({ status: 401, code: 'UNAUTHORIZED', message });
  }

  static badRequest(message: string, details?: Record<string, string>, cause?: unknown): ApiError {
    return new ApiError({ status: 400, code: 'BAD_REQUEST', message, details, cause });
  }

  static validation(details: Record<string, string>): ApiError {
    return new ApiError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    });
  }

  static notFound(message = 'Not found'): ApiError {
    return new ApiError({ status: 404, code: 'NOT_FOUND', message });
  }

  static conflict(message: string, details?: Record<string, string>, cause?: unknown): ApiError {
    return new ApiError({ status: 409, code: 'ROOM_NAME_CONFLICT', message, details, cause });
  }

  static constraint(message: string, details?: Record<string, string>, cause?: unknown): ApiError {
    return new ApiError({ status: 422, code: 'DB_CONSTRAINT_VIOLATION', message, details, cause });
  }
}

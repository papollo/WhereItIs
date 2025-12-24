import type { AuthError } from '@supabase/supabase-js';
import { ApiError } from '../shared/api-error';

const INVALID_CREDENTIALS = ['invalid login credentials', 'invalid email or password'];
const EMAIL_EXISTS = ['already registered', 'already exists'];
const USER_NOT_FOUND = ['user not found'];
const TOKEN_EXPIRED = ['expired', 'invalid'];

function matches(message: string, phrases: string[]): boolean {
  return phrases.some((phrase) => message.includes(phrase));
}

function mapSupabaseAuthError(error: AuthError, status?: number): ApiError {
  return new ApiError({
    status: status ?? 500,
    code: 'SUPABASE_ERROR',
    message: error.message,
    cause: error,
  });
}

export function mapSignupAuthError(error: AuthError): ApiError {
  const status = error.status ?? 500;
  const message = error.message.toLowerCase();

  if (status === 400) {
    return ApiError.badRequest(error.message, undefined, error);
  }

  if (status === 409 || matches(message, EMAIL_EXISTS)) {
    return new ApiError({
      status: 409,
      code: 'SUPABASE_ERROR',
      message: 'Email already exists',
      cause: error,
    });
  }

  return mapSupabaseAuthError(error, status);
}

export function mapLoginAuthError(error: AuthError): ApiError {
  const status = error.status ?? 500;
  const message = error.message.toLowerCase();

  if (status === 401 || status === 400 || matches(message, INVALID_CREDENTIALS)) {
    return ApiError.unauthorized('Invalid email or password');
  }

  return mapSupabaseAuthError(error, status);
}

export function mapForgotPasswordAuthError(error: AuthError): ApiError {
  const status = error.status ?? 500;
  const message = error.message.toLowerCase();

  if (status === 400) {
    return ApiError.badRequest(error.message, undefined, error);
  }

  if (status === 404 || matches(message, USER_NOT_FOUND)) {
    return ApiError.notFound('Email not found');
  }

  return mapSupabaseAuthError(error, status);
}

export function mapResetPasswordAuthError(error: AuthError): ApiError {
  const status = error.status ?? 500;
  const message = error.message.toLowerCase();

  if (status === 400 || matches(message, TOKEN_EXPIRED)) {
    return ApiError.badRequest('Reset token is invalid or expired', undefined, error);
  }

  return mapSupabaseAuthError(error, status);
}

export function mapLogoutAuthError(error: AuthError): ApiError {
  const status = error.status ?? 500;

  if (status === 401) {
    return ApiError.unauthorized(error.message);
  }

  return mapSupabaseAuthError(error, status);
}

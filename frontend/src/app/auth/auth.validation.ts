import type {
  AuthForgotPasswordCommand,
  AuthLoginCommand,
  AuthResetPasswordCommand,
  AuthSignupCommand,
} from './auth.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'email is required';
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'email must be a valid address';
  }

  return null;
}

function validatePassword(value: string): string | null {
  if (value.length === 0) {
    return 'password is required';
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return `password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return null;
}

function validateAccessToken(value: string): string | null {
  if (value.trim().length === 0) {
    return 'access_token is required';
  }

  return null;
}

export function validateAuthSignupCommand(
  command: AuthSignupCommand
): Record<keyof AuthSignupCommand, string> | null {
  const errors: Partial<Record<keyof AuthSignupCommand, string>> = {};

  const emailError = validateEmail(command.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(command.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<keyof AuthSignupCommand, string>;
}

export function validateAuthLoginCommand(
  command: AuthLoginCommand
): Record<keyof AuthLoginCommand, string> | null {
  const errors: Partial<Record<keyof AuthLoginCommand, string>> = {};

  const emailError = validateEmail(command.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(command.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<keyof AuthLoginCommand, string>;
}

export function validateAuthForgotPasswordCommand(
  command: AuthForgotPasswordCommand
): Record<keyof AuthForgotPasswordCommand, string> | null {
  const errors: Partial<Record<keyof AuthForgotPasswordCommand, string>> = {};

  const emailError = validateEmail(command.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors as Record<keyof AuthForgotPasswordCommand, string>;
}

export function validateAuthResetPasswordCommand(
  command: AuthResetPasswordCommand
): Record<string, string> | null {
  const errors: Record<string, string> = {};

  const accessTokenError = validateAccessToken(command.access_token);
  if (accessTokenError) {
    errors.access_token = accessTokenError;
  }

  const passwordError = validatePassword(command.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return errors;
}

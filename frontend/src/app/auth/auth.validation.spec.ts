import {
  validateAuthForgotPasswordCommand,
  validateAuthLoginCommand,
  validateAuthResetPasswordCommand,
  validateAuthSignupCommand,
} from './auth.validation';

describe('auth.validation', () => {
  it('rejects empty email for signup', () => {
    const errors = validateAuthSignupCommand({ email: ' ', password: 'secret1' });

    expect(errors?.email).toBe('email is required');
  });

  it('rejects invalid email for login', () => {
    const errors = validateAuthLoginCommand({ email: 'invalid', password: 'secret1' });

    expect(errors?.email).toBe('email must be a valid address');
  });

  it('rejects short password for signup', () => {
    const errors = validateAuthSignupCommand({ email: 'user@test.com', password: '123' });

    expect(errors?.password).toBe('password must be at least 6 characters');
  });

  it('rejects empty email for forgot password', () => {
    const errors = validateAuthForgotPasswordCommand({ email: ' ' });

    expect(errors?.email).toBe('email is required');
  });

  it('rejects empty tokens on reset password', () => {
    const errors = validateAuthResetPasswordCommand({
      access_token: ' ',
      refresh_token: ' ',
      password: 'secret1',
    });

    expect(errors?.['access_token']).toBe('access_token is required');
    expect(errors?.['refresh_token']).toBe('refresh_token is required');
  });
});

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';
import { ApiError } from '../shared/api-error';
import type {
  AuthForgotPasswordCommand,
  AuthForgotPasswordResponseDto,
  AuthLoginCommand,
  AuthLoginResponseDto,
  AuthLogoutResponseDto,
  AuthResetPasswordCommand,
  AuthResetPasswordResponseDto,
  AuthSignupCommand,
  AuthSignupResponseDto,
} from './auth.types';
import {
  mapForgotPasswordAuthError,
  mapLoginAuthError,
  mapLogoutAuthError,
  mapResetPasswordAuthError,
  mapSignupAuthError,
} from './auth.errors';
import {
  validateAuthForgotPasswordCommand,
  validateAuthLoginCommand,
  validateAuthResetPasswordCommand,
  validateAuthSignupCommand,
} from './auth.validation';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private readonly supabase = inject(SupabaseService);

  async signUp(command: AuthSignupCommand): Promise<AuthSignupResponseDto> {
    const validationErrors = validateAuthSignupCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const email = command.email.trim();
    const { data, error } = await this.supabase
      .getClient()
      .auth.signUp({ email, password: command.password });

    if (error) {
      throw mapSignupAuthError(error);
    }

    if (!data.user) {
      throw ApiError.badRequest('Signup failed to create user');
    }

    if (!data.session) {
      throw ApiError.badRequest('Signup did not return a session');
    }

    if (!data.user.email) {
      throw ApiError.badRequest('Signup did not return user email');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session.access_token,
      },
    };
  }

  async login(command: AuthLoginCommand): Promise<AuthLoginResponseDto> {
    const validationErrors = validateAuthLoginCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const email = command.email.trim();
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({ email, password: command.password });

    if (error) {
      throw mapLoginAuthError(error);
    }

    if (!data.user || !data.session) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
      },
    };
  }

  async requestPasswordReset(
    command: AuthForgotPasswordCommand
  ): Promise<AuthForgotPasswordResponseDto> {
    const validationErrors = validateAuthForgotPasswordCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const email = command.email.trim();
    const { error } = await this.supabase
      .getClient()
      .auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    if (error) {
      throw mapForgotPasswordAuthError(error);
    }

    return { message: 'reset email sent' };
  }

  async resetPassword(command: AuthResetPasswordCommand): Promise<AuthResetPasswordResponseDto> {
    const validationErrors = validateAuthResetPasswordCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const { error: sessionError } = await this.supabase.getClient().auth.setSession({
      access_token: command.access_token,
      refresh_token: command.refresh_token,
    });

    if (sessionError) {
      throw mapResetPasswordAuthError(sessionError);
    }

    const { error } = await this.supabase.getClient().auth.updateUser({
      password: command.password,
    });

    if (error) {
      throw mapResetPasswordAuthError(error);
    }

    return { message: 'password updated' };
  }

  async logout(): Promise<AuthLogoutResponseDto> {
    const { error } = await this.supabase.getClient().auth.signOut();

    if (error) {
      throw mapLogoutAuthError(error);
    }

    return { message: 'logged out' };
  }
}

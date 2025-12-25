import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../shared/api-error';
import { AuthApi } from '../../auth.api';
import { AuthFormCardComponent } from '../../components/auth-form-card.component';
import { InlineErrorComponent } from '../../components/inline-error.component';
import { PasswordFieldComponent } from '../../components/password-field.component';
import { AuthLayoutComponent } from '../../layouts/auth-layout.component';

const passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSnackBarModule,
    RouterLink,
    AuthLayoutComponent,
    AuthFormCardComponent,
    PasswordFieldComponent,
    InlineErrorComponent,
  ],
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss'],
})
export class ResetPasswordPageComponent {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [passwordMatchValidator] }
  );

  formError = '';
  isSubmitting = false;
  private accessToken = '';
  private refreshToken = '';

  constructor() {
    const fragment = this.route.snapshot.fragment ?? '';
    const tokens = parseAuthFragment(fragment);
    this.accessToken = tokens.accessToken ?? '';
    this.refreshToken = tokens.refreshToken ?? '';

    if (!this.accessToken || !this.refreshToken) {
      this.formError = 'Brakuje tokenu resetu hasla.';
    }
  }

  async submit(): Promise<void> {
    this.formError = '';
    this.form.markAllAsTouched();

    if (!this.accessToken || !this.refreshToken) {
      this.formError = 'Brakuje tokenu resetu hasla.';
      return;
    }

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const { password } = this.form.getRawValue();
      await this.authApi.resetPassword({
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
        password,
      });
      this.snackBar.open('Haslo zostalo zaktualizowane.', 'Zamknij', { duration: 3000 });
      await this.router.navigate(['/login']);
    } catch (err) {
      this.formError = this.formatError(err);
    } finally {
      this.isSubmitting = false;
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof ApiError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Wystapil nieznany blad.';
  }
}

function parseAuthFragment(fragment: string): { accessToken?: string; refreshToken?: string } {
  if (!fragment) {
    return {};
  }

  const params = fragment.split('&').reduce<Record<string, string>>((acc, part) => {
    const [rawKey, rawValue] = part.split('=');
    if (!rawKey || !rawValue) {
      return acc;
    }

    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
    return acc;
  }, {});

  return {
    accessToken: params['access_token'],
    refreshToken: params['refresh_token'],
  };
}

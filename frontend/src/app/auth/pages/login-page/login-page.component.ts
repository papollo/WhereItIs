import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../shared/api-error';
import { AuthApi } from '../../auth.api';
import { AuthFormCardComponent } from '../../components/auth-form-card.component';
import { InlineErrorComponent } from '../../components/inline-error.component';
import { PasswordFieldComponent } from '../../components/password-field.component';
import { AuthLayoutComponent } from '../../layouts/auth-layout.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    RouterLink,
    AuthLayoutComponent,
    AuthFormCardComponent,
    PasswordFieldComponent,
    InlineErrorComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formError = '';
  isSubmitting = false;

  async submit(): Promise<void> {
    this.formError = '';
    this.clearCredentialError();
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      await this.authApi.login(this.form.getRawValue());
      this.snackBar.open('Zalogowano pomyslnie.', 'Zamknij', { duration: 2500 });
      await this.router.navigate(['/rooms']);
    } catch (err) {
      if (this.isInvalidCredentials(err)) {
        this.applyCredentialError();
        this.formError = 'Nieprawidlowy email lub haslo.';
      } else {
        this.formError = this.formatError(err);
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  private isInvalidCredentials(error: unknown): boolean {
    if (error instanceof ApiError) {
      return error.code === 'UNAUTHORIZED';
    }

    if (error instanceof Error) {
      return error.message.toLowerCase().includes('invalid login credentials');
    }

    if (!error || typeof error !== 'object') {
      return false;
    }

    const candidate = error as { code?: string; message?: string };
    if (candidate.code === 'invalid_credentials') {
      return true;
    }

    return candidate.message?.toLowerCase().includes('invalid login credentials') ?? false;
  }

  private applyCredentialError(): void {
    const control = this.form.controls.password;
    const errors = control.errors ?? {};

    if (errors['invalidCredentials']) {
      return;
    }

    control.setErrors({ ...errors, invalidCredentials: true });
  }

  private clearCredentialError(): void {
    const control = this.form.controls.password;
    const errors = control.errors;

    if (!errors || !errors['invalidCredentials']) {
      return;
    }

    const { invalidCredentials, ...remainingErrors } = errors;
    control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
  }

  private formatError(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.code === 'UNAUTHORIZED') {
        return 'Nieprawidlowy email lub haslo.';
      }

      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Wystapil nieznany blad.';
  }
}

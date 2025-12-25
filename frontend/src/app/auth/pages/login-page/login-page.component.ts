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

import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../../shared/api-error';
import { AuthApi } from '../../auth.api';
import { AuthFormCardComponent } from '../../components/auth-form-card.component';
import { InlineErrorComponent } from '../../components/inline-error.component';
import { AuthLayoutComponent } from '../../layouts/auth-layout.component';

@Component({
  selector: 'app-forgot-password-page',
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
    InlineErrorComponent,
  ],
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss'],
})
export class ForgotPasswordPageComponent {
  private readonly authApi = inject(AuthApi);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
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
      await this.authApi.requestPasswordReset(this.form.getRawValue());
      this.snackBar.open('Link resetu hasla zostal wyslany.', 'Zamknij', {
        duration: 4000,
      });
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

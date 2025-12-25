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
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
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
  selector: 'app-register-page',
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
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
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

  async submit(): Promise<void> {
    this.formError = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const { email, password } = this.form.getRawValue();
      await this.authApi.signUp({ email, password });
      this.snackBar.open('Konto utworzone. Sprawdz email, aby potwierdzic.', 'Zamknij', {
        duration: 4000,
      });
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


import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    AuthLayoutComponent,
    AuthFormCardComponent,
    InlineErrorComponent
],
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss'],
})
export class ForgotPasswordPageComponent {
  private readonly authApi = inject(AuthApi);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  formError = '';
  isSubmitting = false;
  isEmailSent = false;

  async submit(): Promise<void> {
    this.formError = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      await this.authApi.requestPasswordReset(this.form.getRawValue());
      this.isEmailSent = true;
      this.cdr.detectChanges();
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

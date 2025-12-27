
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './password-field.component.html',
  styleUrls: ['./password-field.component.scss'],
})
export class PasswordFieldComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input() label = 'Haslo';
  @Input() autocomplete = 'current-password';
  @Input() hint?: string;

  isVisible = false;

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }
}

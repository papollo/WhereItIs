import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <form class="search-form" (submit)="onSubmit($event)">
      <mat-form-field appearance="outline" class="search-form__field">
        <mat-label>Wyszukaj przedmiot</mat-label>
        <input
          matInput
          [value]="query"
          (input)="onInput($event)"
          [disabled]="disabled"
          maxlength="200"
        />
        <mat-error *ngIf="error">{{ error }}</mat-error>
      </mat-form-field>
      <button
        mat-flat-button
        color="primary"
        type="submit"
        [disabled]="disabled || !isQueryValid"
      >
        Szukaj
      </button>
    </form>
  `,
  styles: [
    `
      .search-form {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px;
        align-items: start;
      }

      .search-form__field {
        width: 100%;
      }

      @media (max-width: 720px) {
        .search-form {
          grid-template-columns: minmax(0, 1fr);
        }

        .search-form button {
          width: 100%;
        }
      }
    `,
  ],
})
export class SearchFormComponent {
  @Input() query = '';
  @Input() disabled = false;
  @Input() error?: string;
  @Output() update = new EventEmitter<string>();
  @Output() submitQuery = new EventEmitter<string>();

  get isQueryValid(): boolean {
    return this.query.trim().length > 0;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.update.emit(target.value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.isQueryValid) {
      return;
    }
    this.submitQuery.emit(this.query);
  }
}

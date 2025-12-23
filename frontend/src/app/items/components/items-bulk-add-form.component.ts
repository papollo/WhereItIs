import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { ItemDraftVM } from '../items.view-models';

@Component({
  selector: 'app-items-bulk-add-form',
  standalone: true,
  imports: [NgFor, NgIf, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="items-form">
      <header class="items-form__header">
        <h3>Dodaj przedmioty</h3>
        <button mat-stroked-button type="button" (click)="add.emit()" [disabled]="saving">
          +
        </button>
      </header>

      <div class="items-form__rows">
        <div class="items-form__row" *ngFor="let draft of drafts; trackBy: trackByDraftId">
          <mat-form-field appearance="outline" class="items-form__field">
            <mat-label>Przedmiot</mat-label>
            <input
              matInput
              [value]="draft.name"
              (input)="onInputChange(draft.id, $event)"
              maxlength="200"
            />
            <mat-error *ngIf="draft.error">{{ draft.error }}</mat-error>
            <mat-error *ngIf="!draft.error && draft.serverError">
              {{ draft.serverError }}
            </mat-error>
          </mat-form-field>
          <button
            mat-stroked-button
            color="warn"
            type="button"
            (click)="remove.emit(draft.id)"
            [disabled]="saving || drafts.length === 1"
          >
            Usun
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .items-form {
        display: grid;
        gap: 12px;
      }

      .items-form__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .items-form__header h3 {
        margin: 0;
      }

      .items-form__rows {
        display: grid;
        gap: 12px;
      }

      .items-form__row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px;
        align-items: start;
      }

      .items-form__field {
        width: 100%;
      }
    `,
  ],
})
export class ItemsBulkAddFormComponent {
  @Input({ required: true }) drafts: ItemDraftVM[] = [];
  @Input() saving = false;
  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<string>();
  @Output() update = new EventEmitter<{ id: string; name: string }>();

  trackByDraftId(_: number, draft: ItemDraftVM): string {
    return draft.id;
  }

  onInputChange(id: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.update.emit({ id, name: target.value });
  }
}

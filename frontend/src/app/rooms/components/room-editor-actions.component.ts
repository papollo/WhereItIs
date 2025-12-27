import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-room-editor-actions',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="room-editor-actions">
      <button
        mat-stroked-button
        type="button"
        data-testid="room-cancel-button"
        (click)="cancel.emit()"
      >
        Anuluj
      </button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        [disabled]="!canSave || isSaving"
        (click)="save.emit()"
        data-testid="room-save-button"
      >
        {{ isSaving ? 'Zapisywanie...' : 'Zapisz' }}
      </button>
    </div>
  `,
  styles: [
    `
      .room-editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    `,
  ],
})
export class RoomEditorActionsComponent {
  @Input() canSave = false;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}

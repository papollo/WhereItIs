import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-items-dialog-actions',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancelAction.emit()" [disabled]="saving">Anuluj</button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        (click)="saveAction.emit()"
        [disabled]="!canSave || saving"
      >
        Zapisz
      </button>
    </mat-dialog-actions>
  `,
})
export class ItemsDialogActionsComponent {
  @Input() canSave = false;
  @Input() saving = false;
  @Output() cancelAction = new EventEmitter<void>();
  @Output() saveAction = new EventEmitter<void>();
}

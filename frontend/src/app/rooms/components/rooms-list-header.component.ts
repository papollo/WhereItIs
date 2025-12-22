import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-rooms-list-header',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <header class="rooms-list-header">
      <div>
        <h1>Twoje pokoje</h1>
        <p class="rooms-list-header__subtitle">Zarzadzaj przestrzenia i dodawaj nowe pokoje.</p>
      </div>
      <button mat-flat-button color="primary" type="button" (click)="create.emit()">
        Dodaj pokoj
      </button>
    </header>
  `,
  styles: [
    `
      .rooms-list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .rooms-list-header h1 {
        margin: 0 0 4px;
      }

      .rooms-list-header__subtitle {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class RoomsListHeaderComponent {
  @Output() create = new EventEmitter<void>();
}

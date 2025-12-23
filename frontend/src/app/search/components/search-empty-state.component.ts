import { Component } from '@angular/core';

@Component({
  selector: 'app-search-empty-state',
  standalone: true,
  template: `
    <section class="search-empty">
      <h2>Brak wynikow</h2>
      <p>Sprobuj uzyc innej nazwy lub mniej szczegolnego zapytania.</p>
    </section>
  `,
  styles: [
    `
      .search-empty {
        display: grid;
        gap: 6px;
        padding: 24px;
        border-radius: 16px;
        border: 1px dashed rgba(31, 31, 28, 0.2);
        background: rgba(255, 255, 255, 0.6);
      }

      .search-empty h2 {
        margin: 0;
      }

      .search-empty p {
        margin: 0;
        color: rgba(31, 31, 28, 0.7);
      }
    `,
  ],
})
export class SearchEmptyStateComponent {}

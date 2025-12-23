import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { SearchResultVM } from '../search.view-models';
import { SearchResultItemComponent } from './search-result-item.component';

@Component({
  selector: 'app-search-results-list',
  standalone: true,
  imports: [NgFor, SearchResultItemComponent],
  template: `
    <section class="search-results" aria-label="Wyniki wyszukiwania">
      <app-search-result-item
        *ngFor="let item of items; trackBy: trackByResultId"
        [item]="item"
        (open)="open.emit($event)"
      />
    </section>
  `,
  styles: [
    `
      .search-results {
        display: grid;
        gap: 12px;
      }
    `,
  ],
})
export class SearchResultsListComponent {
  @Input({ required: true }) items: SearchResultVM[] = [];
  @Output() open = new EventEmitter<SearchResultVM>();

  trackByResultId(_: number, item: SearchResultVM): string {
    return item.itemId;
  }
}

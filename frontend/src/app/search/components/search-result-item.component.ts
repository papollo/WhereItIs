import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { SearchResultVM } from '../search.view-models';

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  template: `
    <button class="search-result" type="button" (click)="open.emit(item)">
      <div class="search-result__title">{{ item.itemName }}</div>
      <div class="search-result__meta">
        <span>Mebel: {{ item.furnitureName }}</span>
        <span>Pokoj: {{ item.roomName }}</span>
      </div>
    </button>
  `,
  styles: [
    `
      .search-result {
        display: grid;
        gap: 4px;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1px solid rgba(31, 31, 28, 0.12);
        background: #fff;
        text-align: left;
        cursor: pointer;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .search-result:hover {
        border-color: rgba(31, 31, 28, 0.3);
        box-shadow: 0 6px 12px rgba(31, 31, 28, 0.08);
      }

      .search-result__title {
        font-weight: 600;
      }

      .search-result__meta {
        display: flex;
        gap: 16px;
        color: rgba(31, 31, 28, 0.7);
        font-size: 13px;
      }

      @media (max-width: 720px) {
        .search-result__meta {
          flex-direction: column;
          gap: 4px;
        }
      }
    `,
  ],
})
export class SearchResultItemComponent {
  @Input({ required: true }) item!: SearchResultVM;
  @Output() open = new EventEmitter<SearchResultVM>();
}

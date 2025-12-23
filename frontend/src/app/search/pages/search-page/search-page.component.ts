import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiError } from '../../../shared/api-error';
import { SearchApi } from '../../search.api';
import { validateSearchItemsQuery } from '../../search.validation';
import type { SearchItemsQuery } from '../../search.types';
import {
  mapSearchResult,
  type SearchResultVM,
  type SearchStateVM,
} from '../../search.view-models';
import { SearchEmptyStateComponent } from '../../components/search-empty-state.component';
import { SearchFormComponent } from '../../components/search-form.component';
import { SearchResultsListComponent } from '../../components/search-results-list.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    NgIf,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SearchFormComponent,
    SearchResultsListComponent,
    SearchEmptyStateComponent,
  ],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent {
  private readonly searchApi = inject(SearchApi);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  state: SearchStateVM = {
    query: '',
    results: [],
    isLoading: false,
    hasSearched: false,
  };
  formError?: string;

  updateQuery(value: string): void {
    this.patchState({ query: value });
    if (this.formError) {
      this.formError = undefined;
    }
  }

  async submitQuery(query: string): Promise<void> {
    const trimmed = query.trim();
    const request: SearchItemsQuery = {
      q: trimmed,
      limit: 20,
      sort: 'relevance',
    };
    const validationErrors = validateSearchItemsQuery(request);
    if (validationErrors) {
      this.formError = this.describeValidation(validationErrors);
      return;
    }

    this.patchState({ isLoading: true });
    let results: SearchResultVM[] | null = null;
    try {
      const response = await this.searchApi.searchItems(request);
      results = response.data.map(mapSearchResult);
      this.patchState({ query: trimmed, results });
    } catch (err: unknown) {
      this.handleError(err);
    } finally {
      this.patchState({ isLoading: false, hasSearched: true });
    }
  }

  openResult(result: SearchResultVM): void {
    void this.router.navigate(['/rooms', result.roomId], {
      queryParams: { furnitureId: result.furnitureId },
    });
  }

  private handleError(err: unknown): void {
    if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
      this.formError = this.describeValidation(err.details ?? {});
      return;
    }

    const message = this.formatError(err);
    this.snackBar.open(message, 'Zamknij', { duration: 4000 });
  }

  private describeValidation(details: Record<string, string>): string {
    if (details['q']) {
      return 'Wpisz fraze do wyszukania.';
    }

    const firstError = Object.values(details)[0];
    return firstError ?? 'Niepoprawne zapytanie.';
  }

  private formatError(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.code === 'UNAUTHORIZED') {
        return 'Brak autoryzacji.';
      }

      if (error.code === 'BAD_REQUEST') {
        return 'Niepoprawne zapytanie.';
      }

      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Wystapil nieznany blad.';
  }

  private patchState(patch: Partial<SearchStateVM>): void {
    this.zone.run(() => {
      this.state = { ...this.state, ...patch };
      this.cdr.detectChanges();
    });
  }
}

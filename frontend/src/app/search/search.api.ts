import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';
import { ApiError } from '../shared/api-error';
import { mapSearchItemsPostgrestError } from './search.errors';
import type { SearchItemsQuery, SearchItemsResponseDto } from './search.types';
import { SEARCH_SELECT } from './search.types';
import { validateSearchItemsQuery } from './search.validation';

type ItemSearchRow = {
  id: string;
  name: string;
  furniture: { id: string; name: string; room: { id: string; name: string } | null } | null;
};

@Injectable({
  providedIn: 'root',
})
export class SearchApi {
  private readonly supabase = inject(SupabaseService);

  async searchItems(query: SearchItemsQuery): Promise<SearchItemsResponseDto> {
    const validationErrors = validateSearchItemsQuery(query);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const trimmed = query.q.trim();
    let request = this.supabase
      .getClient()
      .from('items')
      .select(SEARCH_SELECT)
      .ilike('name', `%${trimmed}%`);

    if (query.sort === 'name' || query.sort === 'created_at') {
      request = request.order(query.sort, { ascending: query.order !== 'desc' });
    }

    if (query.limit !== undefined) {
      const start = query.offset ?? 0;
      const end = start + query.limit - 1;
      request = request.range(start, end);
    }

    const { data, error, status } = await request;

    if (error) {
      throw mapSearchItemsPostgrestError(error, status);
    }

    const rows = (data ?? []) as ItemSearchRow[];
    const results = rows
      .filter((row) => row.furniture && row.furniture.room)
      .map((row) => ({
        item_id: row.id,
        item_name: row.name,
        furniture: { id: row.furniture!.id, name: row.furniture!.name },
        room: { id: row.furniture!.room!.id, name: row.furniture!.room!.name },
      }));

    return { data: results };
  }
}

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';
import { ApiError } from '../shared/api-error';
import {
  mapCreateItemsPostgrestError,
  mapDeleteItemPostgrestError,
  mapListItemsPostgrestError,
} from './items.errors';
import type {
  ItemCreateFailureDto,
  ItemCreateRequest,
  ItemCreateResponseDto,
  ItemListItemDto,
  ItemListResponseDto,
  ListFurnitureItemsQuery,
} from './items.types';
import { ITEM_LIST_SELECT } from './items.types';
import {
  validateCreateItemsRequest,
  validateFurnitureId,
  validateItemId,
  validateListFurnitureItemsQuery,
} from './items.validation';
import { AuthSessionService } from '../auth/auth-session.service';

@Injectable({
  providedIn: 'root',
})
export class ItemsApi {
  private readonly supabase = inject(SupabaseService);
  private readonly authSession = inject(AuthSessionService);

  async listFurnitureItems(query: ListFurnitureItemsQuery): Promise<ItemListResponseDto> {
    const validationErrors = validateListFurnitureItemsQuery(query);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const orderBy = query.sort ?? query.orderBy ?? 'created_at';
    const orderDirection = query.order ?? query.orderDirection ?? 'desc';

    let request = this.supabase
      .getClient()
      .from('items')
      .select(ITEM_LIST_SELECT)
      .eq('furniture_id', query.furnitureId)
      .order(orderBy, { ascending: orderDirection === 'asc' });

    if (query.q) {
      request = request.ilike('name', `%${query.q.trim()}%`);
    }

    if (query.limit !== undefined) {
      const start = query.offset ?? 0;
      const end = start + query.limit - 1;
      request = request.range(start, end);
    }

    const { data, error, status } = await request;

    if (error) {
      throw mapListItemsPostgrestError(error, status);
    }

    return { data: data ?? [] };
  }

  async createFurnitureItems(
    furnitureId: string,
    request: ItemCreateRequest
  ): Promise<ItemCreateResponseDto> {
    const idErrors = validateFurnitureId(furnitureId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const validationErrors = validateCreateItemsRequest(request);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const created: ItemListItemDto[] = [];
    const failed: ItemCreateFailureDto[] = [];
    const userId = this.authSession.getUserIdOrThrow();

    for (const item of request.items) {
      const payload = {
        furniture_id: furnitureId,
        name: item.name.trim(),
        user_id: userId,
        created_by: userId,
      };

      const { data, error, status } = await this.supabase
        .getClient()
        .from('items')
        .insert(payload)
        .select(ITEM_LIST_SELECT)
        .single();

      if (error) {
        const mapped = mapCreateItemsPostgrestError(error, status);
        if (mapped.status === 401) {
          throw mapped;
        }
        failed.push({ name: item.name, error: mapped.message });
        continue;
      }

      if (data) {
        created.push(data);
      }
    }

    return { created, failed };
  }

  async deleteItem(itemId: string): Promise<void> {
    const idErrors = validateItemId(itemId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const { data, error, status } = await this.supabase
      .getClient()
      .from('items')
      .delete()
      .eq('id', itemId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw mapDeleteItemPostgrestError(error, status);
    }

    if (!data) {
      throw ApiError.notFound('Item not found');
    }
  }
}

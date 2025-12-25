import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';
import type {
  CreateFurnitureCommand,
  CreateFurniturePayload,
  FurnitureDto,
  FurniturePlacementDto,
  FurniturePlacementUpsertRequest,
  ListFurnitureQuery,
  UpdateFurnitureCommand,
} from './furniture.types';
import { FURNITURE_DTO_SELECT, FURNITURE_PLACEMENT_SELECT } from './furniture.types';
import { ApiError } from '../shared/api-error';
import {
  mapCreateFurniturePostgrestError,
  mapDeleteFurniturePostgrestError,
  mapGetFurniturePostgrestError,
  mapFurniturePlacementPostgrestError,
  mapListFurniturePostgrestError,
  mapUpdateFurniturePostgrestError,
} from './furniture.errors';
import {
  validateCreateFurnitureCommand,
  validateFurnitureId,
  validateFurniturePlacementRequest,
  validateListFurnitureQuery,
  validateUpdateFurnitureCommand,
} from './furniture.validation';
import { AuthSessionService } from '../auth/auth-session.service';

@Injectable({
  providedIn: 'root',
})
export class FurnitureApi {
  private readonly supabase = inject(SupabaseService);
  private readonly authSession = inject(AuthSessionService);

  async listFurniture(query: ListFurnitureQuery): Promise<FurnitureDto[]> {
    const validationErrors = validateListFurnitureQuery(query);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const orderBy = query.sort ?? query.orderBy ?? 'created_at';
    const orderDirection = query.order ?? query.orderDirection ?? 'desc';

    let request = this.supabase
      .getClient()
      .from('furniture')
      .select(FURNITURE_DTO_SELECT)
      .eq('room_id', query.roomId)
      .order(orderBy, { ascending: orderDirection === 'asc' });

    if (query.name) {
      request = request.ilike('name', `%${query.name.trim()}%`);
    }

    if (query.limit !== undefined) {
      const start = query.offset ?? 0;
      const end = start + query.limit - 1;
      request = request.range(start, end);
    }

    const { data, error, status } = await request;

    if (error) {
      throw mapListFurniturePostgrestError(error, status);
    }

    return data ?? [];
  }

  async getFurniture(furnitureId: string): Promise<FurnitureDto> {
    const idErrors = validateFurnitureId(furnitureId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const { data, error, status } = await this.supabase
      .getClient()
      .from('furniture')
      .select(FURNITURE_DTO_SELECT)
      .eq('id', furnitureId)
      .maybeSingle();

    if (error) {
      throw mapGetFurniturePostgrestError(error, status);
    }

    if (!data) {
      throw ApiError.notFound('Furniture not found');
    }

    return data;
  }

  async createFurniture(command: CreateFurnitureCommand): Promise<FurnitureDto> {
    const validationErrors = validateCreateFurnitureCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const userId = this.authSession.getUserIdOrThrow();
    const payload: CreateFurniturePayload = {
      user_id: userId,
      created_by: userId,
      ...command,
    };

    const { data, error, status } = await this.supabase
      .getClient()
      .from('furniture')
      .insert(payload)
      .select(FURNITURE_DTO_SELECT)
      .single();

    if (error) {
      throw mapCreateFurniturePostgrestError(error, status);
    }

    return data;
  }

  async updateFurniture(furnitureId: string, command: UpdateFurnitureCommand): Promise<FurnitureDto> {
    const idErrors = validateFurnitureId(furnitureId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const validationErrors = validateUpdateFurnitureCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const { data, error, status } = await this.supabase
      .getClient()
      .from('furniture')
      .update(command)
      .eq('id', furnitureId)
      .select(FURNITURE_DTO_SELECT)
      .single();

    if (error) {
      throw mapUpdateFurniturePostgrestError(error, status);
    }

    return data;
  }

  async deleteFurniture(furnitureId: string): Promise<void> {
    const idErrors = validateFurnitureId(furnitureId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const { data, error, status } = await this.supabase
      .getClient()
      .from('furniture')
      .delete()
      .eq('id', furnitureId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw mapDeleteFurniturePostgrestError(error, status);
    }

    if (!data) {
      throw ApiError.notFound('Furniture not found');
    }
  }

  async getFurniturePlacement(furnitureId: string): Promise<FurniturePlacementDto> {
    const idErrors = validateFurnitureId(furnitureId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const { data, error, status } = await this.supabase
      .getClient()
      .from('furniture_placements')
      .select(FURNITURE_PLACEMENT_SELECT)
      .eq('furniture_id', furnitureId)
      .maybeSingle();

    if (error) {
      throw mapFurniturePlacementPostgrestError(error, status);
    }

    if (!data) {
      throw ApiError.notFound('Furniture placement not found');
    }

    return data;
  }

  async upsertFurniturePlacement(
    furnitureId: string,
    request: FurniturePlacementUpsertRequest
  ): Promise<FurniturePlacementDto> {
    const idErrors = validateFurnitureId(furnitureId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const validationErrors = validateFurniturePlacementRequest(request);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const payload = {
      furniture_id: furnitureId,
      ...request,
    };

    const { data, error, status } = await this.supabase
      .getClient()
      .from('furniture_placements')
      .upsert(payload, { onConflict: 'furniture_id' })
      .select(FURNITURE_PLACEMENT_SELECT)
      .single();

    if (error) {
      throw mapFurniturePlacementPostgrestError(error, status);
    }

    return data;
  }
}

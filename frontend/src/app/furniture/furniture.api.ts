import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';
import { DEFAULT_USER_ID } from '../../db/supabase.client';
import type {
  CreateFurnitureCommand,
  CreateFurniturePayload,
  FurnitureDto,
  ListFurnitureQuery,
  UpdateFurnitureCommand,
} from './furniture.types';
import { FURNITURE_DTO_SELECT } from './furniture.types';
import { ApiError } from '../shared/api-error';
import {
  mapCreateFurniturePostgrestError,
  mapDeleteFurniturePostgrestError,
  mapListFurniturePostgrestError,
  mapUpdateFurniturePostgrestError,
} from './furniture.errors';
import {
  validateCreateFurnitureCommand,
  validateFurnitureId,
  validateListFurnitureQuery,
  validateUpdateFurnitureCommand,
} from './furniture.validation';

@Injectable({
  providedIn: 'root',
})
export class FurnitureApi {
  private readonly supabase = inject(SupabaseService);

  async listFurniture(query: ListFurnitureQuery): Promise<FurnitureDto[]> {
    const validationErrors = validateListFurnitureQuery(query);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const orderBy = query.orderBy ?? 'created_at';
    const orderDirection = query.orderDirection ?? 'desc';

    const { data, error, status } = await this.supabase
      .getClient()
      .from('furniture')
      .select(FURNITURE_DTO_SELECT)
      .eq('room_id', query.roomId)
      .order(orderBy, { ascending: orderDirection === 'asc' });

    if (error) {
      throw mapListFurniturePostgrestError(error, status);
    }

    return data ?? [];
  }

  async createFurniture(command: CreateFurnitureCommand): Promise<FurnitureDto> {
    const validationErrors = validateCreateFurnitureCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const payload: CreateFurniturePayload = {
      user_id: DEFAULT_USER_ID,
      created_by: DEFAULT_USER_ID,
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

    const { error, status } = await this.supabase
      .getClient()
      .from('furniture')
      .delete()
      .eq('id', furnitureId);

    if (error) {
      throw mapDeleteFurniturePostgrestError(error, status);
    }
  }
}

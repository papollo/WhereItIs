import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';
import { DEFAULT_USER_ID } from '../../db/supabase.client';
import type {
  CreateRoomCommand,
  CreateRoomPayload,
  ListRoomsQuery,
  CreateRoomResponseDto,
  RoomDto,
  RoomsListResponseDto,
  UpdateRoomResponseDto,
  UpdateRoomCommand,
  UUID,
} from './rooms.types';
import { ROOM_CREATE_SELECT, ROOM_DTO_SELECT, ROOM_LIST_SELECT, ROOM_UPDATE_SELECT } from './rooms.types';
import { ApiError } from '../shared/api-error';
import {
  mapCreateRoomPostgrestError,
  mapDeleteRoomPostgrestError,
  mapGetRoomPostgrestError,
  mapListRoomsPostgrestError,
  mapUpdateRoomPostgrestError,
} from './rooms.errors';
import {
  validateCreateRoomCommand,
  validateListRoomsQuery,
  validateRoomId,
  validateUpdateRoomCommand,
} from './rooms.validation';

@Injectable({
  providedIn: 'root',
})
export class RoomsApi {
  private readonly supabase = inject(SupabaseService);

  async getRoom(roomId: UUID): Promise<RoomDto> {
    const idErrors = validateRoomId(roomId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const { data, error, status } = await this.supabase
      .getClient()
      .from('rooms')
      .select(ROOM_DTO_SELECT)
      .eq('id', roomId)
      .maybeSingle();

    if (error) {
      throw mapGetRoomPostgrestError(error, status);
    }

    if (!data) {
      throw ApiError.notFound('Room not found');
    }

    return data;
  }

  async listRooms(query: ListRoomsQuery = {}): Promise<RoomsListResponseDto> {
    const validationErrors = validateListRoomsQuery(query);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const client = this.supabase.getClient();
    const orderBy = query.sort ?? query.orderBy ?? 'created_at';
    const orderDirection = query.order ?? query.orderDirection ?? 'desc';

    let request = client
      .from('rooms')
      .select(ROOM_LIST_SELECT, { count: 'exact' })
      .order(orderBy, {
        ascending: orderDirection === 'asc',
      });

    if (query.name) {
      request = request.ilike('name', `%${query.name.trim()}%`);
    }

    if (query.limit !== undefined) {
      const start = query.offset ?? 0;
      const end = start + query.limit - 1;
      request = request.range(start, end);
    }

    const { data, error, status, count } = await request;

    if (error) {
      throw mapListRoomsPostgrestError(error, status);
    }

    const safeData = data ?? [];
    const limit = query.limit ?? safeData.length;
    const offset = query.offset ?? 0;

    return {
      data: safeData,
      meta: {
        limit,
        offset,
        total: count ?? safeData.length,
      },
    };
  }

  async createRoom(command: CreateRoomCommand): Promise<CreateRoomResponseDto> {
    const validationErrors = validateCreateRoomCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const client = this.supabase.getClient();

    const payload: CreateRoomPayload = {
      user_id: DEFAULT_USER_ID,
      created_by: DEFAULT_USER_ID,
      ...command,
    };

    const { data, error, status } = await client
      .from('rooms')
      .insert(payload)
      .select(ROOM_CREATE_SELECT)
      .single();

    if (error) {
      throw mapCreateRoomPostgrestError(error, status);
    }

    return data;
  }

  async updateRoom(roomId: UUID, command: UpdateRoomCommand): Promise<UpdateRoomResponseDto> {
    const idErrors = validateRoomId(roomId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const validationErrors = validateUpdateRoomCommand(command);
    if (validationErrors) {
      throw ApiError.validation(validationErrors);
    }

    const { data, error, status } = await this.supabase
      .getClient()
      .from('rooms')
      .update(command)
      .eq('id', roomId)
      .select(ROOM_UPDATE_SELECT)
      .maybeSingle();

    if (error) {
      throw mapUpdateRoomPostgrestError(error, status);
    }

    if (!data) {
      throw ApiError.notFound('Room not found');
    }

    return data;
  }

  async deleteRoom(roomId: UUID): Promise<void> {
    const idErrors = validateRoomId(roomId);
    if (idErrors) {
      throw ApiError.validation(idErrors);
    }

    const { data, error, status } = await this.supabase
      .getClient()
      .from('rooms')
      .delete()
      .eq('id', roomId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw mapDeleteRoomPostgrestError(error, status);
    }

    if (!data) {
      throw ApiError.notFound('Room not found');
    }
  }
}

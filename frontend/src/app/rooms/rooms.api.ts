import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';
import { DEFAULT_USER_ID } from '../../db/supabase.client';
import type { CreateRoomCommand, CreateRoomPayload, RoomDto } from './rooms.types';
import { ROOM_DTO_SELECT } from './rooms.types';
import { ApiError } from '../shared/api-error';
import { mapCreateRoomPostgrestError } from './rooms.errors';
import { validateCreateRoomCommand } from './rooms.validation';

@Injectable({
  providedIn: 'root',
})
export class RoomsApi {
  private readonly supabase = inject(SupabaseService);

  async createRoom(command: CreateRoomCommand): Promise<RoomDto> {
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
      .select(ROOM_DTO_SELECT)
      .single();

    if (error) {
      throw mapCreateRoomPostgrestError(error, status);
    }

    return data;
  }
}

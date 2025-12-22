import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiError } from '../shared/api-error';
import type { UUID } from './rooms.types';
import { RoomsApi } from './rooms.api';
import {
  EMPTY_ROOMS_LIST_STATE,
  mapRoomToListItem,
  type RoomsListState,
} from './rooms.view-models';

@Injectable({
  providedIn: 'root',
})
export class RoomsListFacade {
  private readonly roomsApi = inject(RoomsApi);
  private readonly stateSubject = new BehaviorSubject<RoomsListState>(EMPTY_ROOMS_LIST_STATE);

  readonly state$ = this.stateSubject.asObservable();

  async loadRooms(): Promise<void> {
    const current = this.stateSubject.getValue();
    if (current.isLoading) {
      return;
    }

    this.patchState({ isLoading: true, error: null });

    try {
      const response = await this.roomsApi.listRooms({ sort: 'created_at', order: 'desc' });
      const roomsVm = response.data.map(mapRoomToListItem);
      this.patchState({ rooms: roomsVm, isLoading: false });
    } catch (err: unknown) {
      const error = toApiError(err);
      this.patchState({ isLoading: false, error });
      throw error;
    }
  }

  async deleteRoom(roomId: UUID): Promise<void> {
    if (roomId.trim().length === 0) {
      const error = ApiError.validation({ roomId: 'Room id is required' });
      this.patchState({ error });
      throw error;
    }

    const current = this.stateSubject.getValue();
    const previousRooms = current.rooms;
    this.patchState({ rooms: previousRooms.filter((room) => room.id !== roomId), error: null });

    try {
      await this.roomsApi.deleteRoom(roomId);
    } catch (err: unknown) {
      const error = toApiError(err);
      this.patchState({ rooms: previousRooms, error });
      throw error;
    }
  }

  private patchState(update: Partial<RoomsListState>): void {
    const current = this.stateSubject.getValue();
    this.stateSubject.next({ ...current, ...update });
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({
      status: 500,
      code: 'SUPABASE_ERROR',
      message: error.message,
      cause: error,
    });
  }

  return new ApiError({
    status: 500,
    code: 'SUPABASE_ERROR',
    message: 'Unknown error',
  });
}

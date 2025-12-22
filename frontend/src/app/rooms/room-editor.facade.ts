import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiError } from '../shared/api-error';
import { RoomsApi } from './rooms.api';
import type {
  CreateRoomCommand,
  CreateRoomResponseDto,
  RoomDto,
  UpdateRoomCommand,
  UpdateRoomResponseDto,
} from './rooms.types';

export type RoomEditorState = {
  room: RoomDto | null;
  isLoading: boolean;
  isSaving: boolean;
  error: ApiError | null;
  notFound: boolean;
};

const EMPTY_STATE: RoomEditorState = {
  room: null,
  isLoading: false,
  isSaving: false,
  error: null,
  notFound: false,
};

@Injectable({
  providedIn: 'root',
})
export class RoomEditorFacade {
  private readonly roomsApi = inject(RoomsApi);
  private readonly stateSubject = new BehaviorSubject<RoomEditorState>(EMPTY_STATE);

  readonly state$ = this.stateSubject.asObservable();

  reset(): void {
    this.stateSubject.next(EMPTY_STATE);
  }

  async load(roomId: string): Promise<void> {
    const trimmedId = roomId.trim();
    if (trimmedId.length === 0) {
      const error = ApiError.validation({ roomId: 'Room id is required' });
      this.patchState({ error, notFound: true });
      throw error;
    }

    this.patchState({ isLoading: true, error: null, notFound: false });

    try {
      const room = await this.roomsApi.getRoom(trimmedId);
      this.patchState({ room, isLoading: false });
    } catch (err: unknown) {
      const error = toApiError(err);
      if (error instanceof ApiError && error.status === 404) {
        this.patchState({ isLoading: false, notFound: true, room: null, error: null });
        return;
      }
      this.patchState({ isLoading: false, error });
      throw error;
    }
  }

  async createRoom(command: CreateRoomCommand): Promise<CreateRoomResponseDto> {
    this.patchState({ isSaving: true, error: null });
    try {
      const room = await this.roomsApi.createRoom(command);
      this.patchState({ isSaving: false });
      return room;
    } catch (err: unknown) {
      const error = toApiError(err);
      this.patchState({ isSaving: false, error });
      throw error;
    }
  }

  async updateRoom(roomId: string, command: UpdateRoomCommand): Promise<UpdateRoomResponseDto> {
    this.patchState({ isSaving: true, error: null });
    try {
      const room = await this.roomsApi.updateRoom(roomId, command);
      const current = this.stateSubject.getValue();
      const nextRoom = current.room ? { ...current.room, ...room } : current.room;
      this.patchState({ isSaving: false, room: nextRoom });
      return room;
    } catch (err: unknown) {
      const error = toApiError(err);
      this.patchState({ isSaving: false, error });
      throw error;
    }
  }

  private patchState(update: Partial<RoomEditorState>): void {
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

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiError } from '../shared/api-error';
import { FurnitureApi } from '../furniture/furniture.api';
import type { FurnitureListItemVM } from '../furniture/furniture.view-models';
import { mapFurnitureToListItem } from '../furniture/furniture.view-models';
import { RoomsApi } from './rooms.api';
import type { RoomCellDto, RoomDto, UUID } from './rooms.types';

export type RoomDetailsState = {
  room: RoomDto | null;
  cells: RoomCellDto[];
  furniture: FurnitureListItemVM[];
  isLoading: boolean;
  error: ApiError | null;
  notFound: boolean;
};

const EMPTY_STATE: RoomDetailsState = {
  room: null,
  cells: [],
  furniture: [],
  isLoading: false,
  error: null,
  notFound: false,
};

@Injectable({
  providedIn: 'root',
})
export class RoomDetailsFacade {
  private readonly roomsApi = inject(RoomsApi);
  private readonly furnitureApi = inject(FurnitureApi);
  private readonly stateSubject = new BehaviorSubject<RoomDetailsState>(EMPTY_STATE);

  readonly state$ = this.stateSubject.asObservable();

  async load(roomId: UUID): Promise<void> {
    const trimmedId = roomId.trim();
    if (trimmedId.length === 0) {
      const error = ApiError.validation({ roomId: 'Room id is required' });
      this.patchState({ error, notFound: true });
      throw error;
    }

    this.patchState({ isLoading: true, error: null, notFound: false });

    try {
      const [room, cells, furniture] = await Promise.all([
        this.roomsApi.getRoom(trimmedId),
        this.roomsApi.getRoomCells(trimmedId),
        this.furnitureApi.listFurniture({ roomId: trimmedId }),
      ]);

      this.patchState({
        room,
        cells: cells.cells,
        furniture: furniture.map(mapFurnitureToListItem),
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = toApiError(err);
      if (error instanceof ApiError && error.status === 404) {
        this.patchState({
          isLoading: false,
          notFound: true,
          room: null,
          cells: [],
          furniture: [],
          error: null,
        });
        return;
      }
      this.patchState({ isLoading: false, error });
      throw error;
    }
  }

  async createFurniture(roomId: UUID, payload: CreateFurniturePayload): Promise<void> {
    if (roomId.trim().length === 0) {
      const error = ApiError.validation({ roomId: 'Room id is required' });
      this.patchState({ error });
      throw error;
    }

    const created = await this.furnitureApi.createFurniture({
      room_id: roomId,
      ...payload,
    });

    const current = this.stateSubject.getValue();
    this.patchState({ furniture: [mapFurnitureToListItem(created), ...current.furniture] });
  }

  async updateFurniture(furnitureId: UUID, payload: UpdateFurniturePayload): Promise<void> {
    const updated = await this.furnitureApi.updateFurniture(furnitureId, payload);

    const current = this.stateSubject.getValue();
    this.patchState({
      furniture: current.furniture.map((item) =>
        item.id === furnitureId ? mapFurnitureToListItem(updated) : item
      ),
    });
  }

  async deleteFurniture(furnitureId: UUID): Promise<void> {
    const current = this.stateSubject.getValue();
    const previous = current.furniture;

    this.patchState({
      furniture: previous.filter((item) => item.id !== furnitureId),
      error: null,
    });

    try {
      await this.furnitureApi.deleteFurniture(furnitureId);
    } catch (err: unknown) {
      const error = toApiError(err);
      this.patchState({ furniture: previous, error });
      throw error;
    }
  }

  private patchState(update: Partial<RoomDetailsState>): void {
    const current = this.stateSubject.getValue();
    this.stateSubject.next({ ...current, ...update });
  }
}

export type CreateFurniturePayload = {
  name: string;
  description: string;
  color: string;
};

export type UpdateFurniturePayload = CreateFurniturePayload;

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

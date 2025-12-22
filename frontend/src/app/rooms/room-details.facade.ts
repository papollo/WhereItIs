import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiError } from '../shared/api-error';
import { FurnitureApi } from '../furniture/furniture.api';
import type { FurnitureListItemVM } from '../furniture/furniture.view-models';
import { mapFurnitureToListItem } from '../furniture/furniture.view-models';
import type { FurniturePlacementDto, FurniturePlacementUpsertRequest } from '../furniture/furniture.types';
import { RoomsApi } from './rooms.api';
import type { RoomCellDto, RoomDto, UUID } from './rooms.types';

export type RoomDetailsState = {
  room: RoomDto | null;
  cells: RoomCellDto[];
  furniture: FurnitureListItemVM[];
  placements: FurniturePlacementVM[];
  isLoading: boolean;
  error: ApiError | null;
  notFound: boolean;
};

const EMPTY_STATE: RoomDetailsState = {
  room: null,
  cells: [],
  furniture: [],
  placements: [],
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

  get snapshotCells(): RoomCellDto[] {
    return this.stateSubject.getValue().cells;
  }

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

      const placements = await this.loadPlacements(furniture);

      this.patchState({
        room,
        cells: cells.cells,
        furniture: furniture.map(mapFurnitureToListItem),
        placements,
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
          placements: [],
          error: null,
        });
        return;
      }
      this.patchState({ isLoading: false, error });
      throw error;
    }
  }

  async createFurniture(
    roomId: UUID,
    payload: CreateFurniturePayload,
    placement?: FurniturePlacementUpsertRequest
  ): Promise<void> {
    if (roomId.trim().length === 0) {
      const error = ApiError.validation({ roomId: 'Room id is required' });
      this.patchState({ error });
      throw error;
    }

    const created = await this.furnitureApi.createFurniture({
      room_id: roomId,
      ...payload,
    });

    let nextPlacement: FurniturePlacementVM | null = null;
    if (placement) {
      const stored = await this.furnitureApi.upsertFurniturePlacement(created.id, placement);
      nextPlacement = this.toPlacementVm(stored, created.color, created.name);
    }

    const current = this.stateSubject.getValue();
    this.patchState({
      furniture: [mapFurnitureToListItem(created), ...current.furniture],
      placements: nextPlacement ? [nextPlacement, ...current.placements] : current.placements,
    });
  }

  async updateFurniture(
    furnitureId: UUID,
    payload: UpdateFurniturePayload,
    placement?: FurniturePlacementUpsertRequest
  ): Promise<void> {
    const updated = await this.furnitureApi.updateFurniture(furnitureId, payload);

    const current = this.stateSubject.getValue();
    const nextFurniture = current.furniture.map((item) =>
      item.id === furnitureId ? mapFurnitureToListItem(updated) : item
    );
    let nextPlacements = current.placements.map((item) =>
      item.furniture_id === furnitureId
        ? { ...item, color: updated.color, name: updated.name }
        : item
    );

    if (placement) {
      const stored = await this.furnitureApi.upsertFurniturePlacement(furnitureId, placement);
      const mapped = this.toPlacementVm(stored, updated.color, updated.name);
      const exists = nextPlacements.some((item) => item.furniture_id === furnitureId);
      nextPlacements = exists
        ? nextPlacements.map((item) => (item.furniture_id === furnitureId ? mapped : item))
        : [mapped, ...nextPlacements];
    }

    this.patchState({ furniture: nextFurniture, placements: nextPlacements });
  }

  async deleteFurniture(furnitureId: UUID): Promise<void> {
    const current = this.stateSubject.getValue();
    const previous = current.furniture;

    this.patchState({
      furniture: previous.filter((item) => item.id !== furnitureId),
      placements: current.placements.filter((placement) => placement.furniture_id !== furnitureId),
      error: null,
    });

    try {
      await this.furnitureApi.deleteFurniture(furnitureId);
    } catch (err: unknown) {
      const error = toApiError(err);
      this.patchState({ furniture: previous, placements: current.placements, error });
      throw error;
    }
  }

  private patchState(update: Partial<RoomDetailsState>): void {
    const current = this.stateSubject.getValue();
    this.stateSubject.next({ ...current, ...update });
  }

  private async loadPlacements(furniture: FurniturePlacementSource[]): Promise<FurniturePlacementVM[]> {
    const results = await Promise.allSettled(
      furniture.map(async (item) => {
        try {
          const placement = await this.furnitureApi.getFurniturePlacement(item.id);
          return this.toPlacementVm(placement, item.color, item.name);
        } catch {
          return null;
        }
      })
    );

    return results
      .map((result) => (result.status === 'fulfilled' ? result.value : null))
      .filter((placement): placement is FurniturePlacementVM => placement !== null);
  }

  private toPlacementVm(
    placement: FurniturePlacementDto,
    color: string,
    name: string
  ): FurniturePlacementVM {
    return {
      furniture_id: placement.furniture_id,
      room_id: placement.room_id,
      x: placement.x,
      y: placement.y,
      width_cells: placement.width_cells,
      height_cells: placement.height_cells,
      color,
      name,
    };
  }
}

export type CreateFurniturePayload = {
  name: string;
  description: string;
  color: string;
};

export type UpdateFurniturePayload = CreateFurniturePayload;

type FurniturePlacementSource = { id: string; name: string; color: string };

export type FurniturePlacementVM = {
  furniture_id: string;
  room_id: string;
  x: number;
  y: number;
  width_cells: number;
  height_cells: number;
  color: string;
  name: string;
};

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

import type { ApiError } from '../shared/api-error';
import type { RoomListItemDto, UUID } from './rooms.types';

export type RoomListItemVM = {
  id: UUID;
  name: string;
  color: string;
};

export type RoomsListState = {
  rooms: RoomListItemVM[];
  isLoading: boolean;
  error: ApiError | null;
};

export const EMPTY_ROOMS_LIST_STATE: RoomsListState = {
  rooms: [],
  isLoading: false,
  error: null,
};

export function mapRoomToListItem(room: RoomListItemDto): RoomListItemVM {
  return {
    id: room.id,
    name: room.name,
    color: room.color,
  };
}

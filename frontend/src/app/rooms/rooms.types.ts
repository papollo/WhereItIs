import type { Tables, TablesInsert, TablesUpdate } from '../../db/database.types';

export type UUID = string;

export type RoomRow = Tables<'rooms'>;
export type RoomInsert = TablesInsert<'rooms'>;
export type RoomUpdate = TablesUpdate<'rooms'>;

export type OffsetPaginationMeta = {
  limit: number;
  offset: number;
};

export type OffsetPaginationWithTotalMeta = OffsetPaginationMeta & {
  total: number;
};

export type RoomListItemDto = Pick<RoomRow, 'id' | 'name' | 'color'>;

export type RoomDto = Pick<
  RoomRow,
  'id' | 'name' | 'color' | 'created_at' | 'updated_at'
>;

export type RoomOrderBy = 'created_at' | 'name';
export type RoomOrderDirection = 'asc' | 'desc';

export type ListRoomsQuery = {
  name?: string;
  limit?: number;
  offset?: number;
  sort?: RoomOrderBy;
  order?: RoomOrderDirection;
  orderBy?: RoomOrderBy;
  orderDirection?: RoomOrderDirection;
};

export type RoomsListResponseDto = {
  data: RoomListItemDto[];
  meta: OffsetPaginationWithTotalMeta;
};

export type CreateRoomCommand = Pick<RoomRow, 'name' | 'color'>;

export type CreateRoomPayload = CreateRoomCommand & Pick<RoomInsert, 'user_id' | 'created_by'>;

export type CreateRoomResponseDto = Pick<RoomRow, 'id' | 'name' | 'color' | 'created_at'>;

export type UpdateRoomCommand = Partial<Pick<RoomRow, 'name' | 'color'>>;

export type UpdateRoomPayload = UpdateRoomCommand & RoomUpdate;

export type UpdateRoomResponseDto = Pick<RoomRow, 'id' | 'name' | 'color' | 'updated_at'>;

export const ROOM_DTO_SELECT = 'id,name,color,created_at,updated_at' as const;

export const ROOM_LIST_SELECT = 'id,name,color' as const;
export const ROOM_CREATE_SELECT = 'id,name,color,created_at' as const;
export const ROOM_UPDATE_SELECT = 'id,name,color,updated_at' as const;

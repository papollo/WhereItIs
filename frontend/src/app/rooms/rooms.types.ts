import type { Tables, TablesInsert, TablesUpdate } from '../../db/database.types';

export type UUID = string;

export type RoomRow = Tables<'rooms'>;
export type RoomInsert = TablesInsert<'rooms'>;
export type RoomUpdate = TablesUpdate<'rooms'>;

export type RoomDto = Pick<
  RoomRow,
  | 'id'
  | 'name'
  | 'color'
  | 'x_start'
  | 'y_start'
  | 'width_cells'
  | 'height_cells'
  | 'cell_size_m'
  | 'created_at'
  | 'updated_at'
>;

export type RoomOrderBy = 'created_at' | 'name';
export type RoomOrderDirection = 'asc' | 'desc';

export type ListRoomsQuery = {
  name?: string;
  limit?: number;
  offset?: number;
  orderBy?: RoomOrderBy;
  orderDirection?: RoomOrderDirection;
};

export type CreateRoomCommand = Pick<
  RoomRow,
  'name' | 'color' | 'x_start' | 'y_start' | 'width_cells' | 'height_cells' | 'cell_size_m'
>;

export type CreateRoomPayload = CreateRoomCommand & Pick<RoomInsert, 'user_id' | 'created_by'>;

export type UpdateRoomCommand = Partial<
  Pick<RoomRow, 'name' | 'color' | 'x_start' | 'y_start' | 'width_cells' | 'height_cells' | 'cell_size_m'>
>;

export type UpdateRoomPayload = UpdateRoomCommand & RoomUpdate;

export const ROOM_DTO_SELECT =
  'id,name,color,x_start,y_start,width_cells,height_cells,cell_size_m,created_at,updated_at' as const;

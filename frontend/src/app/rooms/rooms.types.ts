import type { Tables, TablesInsert } from '../../db/database.types';

export type UUID = string;

export type RoomRow = Tables<'rooms'>;
export type RoomInsert = TablesInsert<'rooms'>;

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

export type CreateRoomCommand = Pick<
  RoomRow,
  'name' | 'color' | 'x_start' | 'y_start' | 'width_cells' | 'height_cells' | 'cell_size_m'
>;

export type CreateRoomPayload = CreateRoomCommand & Pick<RoomInsert, 'user_id' | 'created_by'>;

export const ROOM_DTO_SELECT =
  'id,name,color,x_start,y_start,width_cells,height_cells,cell_size_m,created_at,updated_at' as const;

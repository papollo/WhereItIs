import type { Tables, TablesInsert, TablesUpdate } from '../../db/database.types';
import type { UUID } from '../rooms/rooms.types';

export type FurnitureRow = Tables<'furniture'>;
export type FurnitureInsert = TablesInsert<'furniture'>;
export type FurnitureUpdate = TablesUpdate<'furniture'>;

export type FurnitureDto = Pick<
  FurnitureRow,
  'id' | 'room_id' | 'name' | 'description' | 'color' | 'created_at' | 'updated_at'
>;

export type FurnitureOrderBy = 'created_at' | 'name';
export type FurnitureOrderDirection = 'asc' | 'desc';

export type ListFurnitureQuery = {
  roomId: UUID;
  orderBy?: FurnitureOrderBy;
  orderDirection?: FurnitureOrderDirection;
};

export type CreateFurnitureCommand = Pick<FurnitureRow, 'room_id' | 'name' | 'description' | 'color'>;

export type CreateFurniturePayload = CreateFurnitureCommand &
  Pick<FurnitureInsert, 'user_id' | 'created_by'>;

export type UpdateFurnitureCommand = Partial<Pick<FurnitureRow, 'name' | 'description' | 'color'>>;

export type UpdateFurniturePayload = UpdateFurnitureCommand & FurnitureUpdate;

export const FURNITURE_DTO_SELECT =
  'id,room_id,name,description,color,created_at,updated_at' as const;

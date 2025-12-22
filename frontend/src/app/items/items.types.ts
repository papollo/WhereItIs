import type { Tables, TablesInsert, TablesUpdate } from '../../db/database.types';
import type { UUID } from '../rooms/rooms.types';

export type ItemRow = Tables<'items'>;
export type ItemInsert = TablesInsert<'items'>;
export type ItemUpdate = TablesUpdate<'items'>;

export type ItemDto = Pick<ItemRow, 'id' | 'furniture_id' | 'name' | 'created_at' | 'updated_at'>;

export type ItemListItemDto = Pick<ItemRow, 'id' | 'name'>;

export type ItemOrderBy = 'created_at' | 'name';
export type ItemOrderDirection = 'asc' | 'desc';

export type ListFurnitureItemsQuery = {
  furnitureId: UUID;
  limit?: number;
  offset?: number;
  sort?: ItemOrderBy;
  order?: ItemOrderDirection;
  orderBy?: ItemOrderBy;
  orderDirection?: ItemOrderDirection;
  q?: string;
};

export type ItemListResponseDto = {
  data: ItemListItemDto[];
};

export type ItemCreateInput = Pick<ItemRow, 'name'>;

export type ItemCreateRequest = {
  items: ItemCreateInput[];
};

export type ItemCreateFailureDto = {
  name: ItemRow['name'];
  error?: string;
};

export type ItemCreateResponseDto = {
  created: ItemListItemDto[];
  failed: ItemCreateFailureDto[];
};

export type ItemRenameRequest = Pick<ItemRow, 'name'>;

export type ItemRenameResponseDto = Pick<ItemRow, 'id' | 'name' | 'updated_at'>;

export const ITEM_LIST_SELECT = 'id,name' as const;
export const ITEM_RENAME_SELECT = 'id,name,updated_at' as const;

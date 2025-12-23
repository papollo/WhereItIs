import type { Tables } from '../../db/database.types';

type ItemRow = Tables<'items'>;
type FurnitureRow = Tables<'furniture'>;
type RoomRow = Tables<'rooms'>;

export type SearchOrderBy = 'relevance' | 'name' | 'created_at';
export type SearchOrderDirection = 'asc' | 'desc';

export type SearchItemsQuery = {
  q: string;
  limit?: number;
  offset?: number;
  sort?: SearchOrderBy;
  order?: SearchOrderDirection;
};

export type SearchItemResultDto = {
  item_id: ItemRow['id'];
  item_name: ItemRow['name'];
  furniture: Pick<FurnitureRow, 'id' | 'name'>;
  room: Pick<RoomRow, 'id' | 'name'>;
};

export type SearchItemsResponseDto = {
  data: SearchItemResultDto[];
};

export const SEARCH_SELECT =
  'id,name,furniture:furniture(id,name,room:rooms(id,name))' as const;

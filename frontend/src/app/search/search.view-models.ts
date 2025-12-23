import type { SearchItemResultDto } from './search.types';

export type SearchResultVM = {
  itemId: string;
  itemName: string;
  furnitureId: string;
  furnitureName: string;
  roomId: string;
  roomName: string;
};

export type SearchStateVM = {
  query: string;
  results: SearchResultVM[];
  isLoading: boolean;
  hasSearched: boolean;
  error?: string;
};

export type SearchFormVM = {
  value: string;
  error?: string;
};

export type SearchFormErrors = {
  q?: string;
};

export function mapSearchResult(dto: SearchItemResultDto): SearchResultVM {
  return {
    itemId: dto.item_id,
    itemName: dto.item_name,
    furnitureId: dto.furniture.id,
    furnitureName: dto.furniture.name,
    roomId: dto.room.id,
    roomName: dto.room.name,
  };
}

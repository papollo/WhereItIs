import type { FurnitureDto } from './furniture.types';
import type { UUID } from '../rooms/rooms.types';

export type FurnitureListItemVM = {
  id: UUID;
  name: string;
  description: string | null;
  color: string;
  updatedAt: string;
};

export function mapFurnitureToListItem(dto: FurnitureDto): FurnitureListItemVM {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    color: dto.color,
    updatedAt: dto.updated_at,
  };
}

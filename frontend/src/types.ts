import type { Database } from './db/database.types';

// Base helpers to keep DTOs aligned with Supabase table shapes.
type Tables = Database['public']['Tables'];
type TableRow<T extends keyof Tables> = Tables[T]['Row'];

export type PaginationMeta = {
  limit: number;
  offset: number;
  total?: number;
};

// Core entities
export type RoomRow = TableRow<'rooms'>;
export type RoomCellRow = TableRow<'room_cells'>;
export type FurnitureRow = TableRow<'furniture'>;
export type FurniturePlacementRow = TableRow<'furniture_placements'>;
export type ItemRow = TableRow<'items'>;
export type OnboardingRow = TableRow<'onboarding'>;
export type EventLogRow = TableRow<'event_logs'>;

// Auth DTOs (Supabase Auth)
export type AuthSignupRequest = {
  email: string;
  password: string;
};

export type AuthSignupResponse = {
  user: { id: string; email: string };
  session: { access_token: string };
};

export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthLoginResponse = {
  access_token: string;
  refresh_token: string;
  user: { id: string };
};

export type AuthLogoutResponse = {
  message: string;
};

// Rooms
export type RoomListItem = Pick<RoomRow, 'id' | 'name' | 'color'>;
export type RoomListResponse = {
  data: RoomListItem[];
  meta: PaginationMeta;
};

export type RoomCreateRequest = Pick<RoomRow, 'name' | 'color'>;
export type RoomCreateResponse = Pick<RoomRow, 'id' | 'name' | 'color' | 'created_at'>;

export type RoomDetailResponse = Pick<
  RoomRow,
  'id' | 'name' | 'color' | 'created_at' | 'updated_at'
>;

export type RoomUpdateRequest = Partial<Pick<RoomRow, 'name' | 'color'>>;
export type RoomUpdateResponse = Pick<RoomRow, 'id' | 'name' | 'color' | 'updated_at'>;

export type DeleteResponse = {
  message: string;
};

// Room cells
export type RoomCell = Pick<RoomCellRow, 'x' | 'y'>;

export type RoomCellsGetResponse = {
  room_id: RoomRow['id'];
  cells: RoomCell[];
};

export type RoomCellsPutRequest = {
  cells: RoomCell[];
};

export type RoomCellsPutResponse = {
  room_id: RoomRow['id'];
  cells_saved: number;
};

// Furniture
export type FurnitureListItem = Pick<FurnitureRow, 'id' | 'name' | 'color'>;
export type FurnitureListResponse = {
  data: FurnitureListItem[];
  meta?: PaginationMeta;
};

export type FurnitureCreateRequest = Pick<FurnitureRow, 'name' | 'description' | 'color'>;
export type FurnitureCreateResponse = Pick<
  FurnitureRow,
  'id' | 'room_id' | 'name' | 'color'
>;

export type FurnitureDetailResponse = Pick<
  FurnitureRow,
  'id' | 'room_id' | 'name' | 'description' | 'color'
>;

export type FurnitureUpdateRequest = Partial<
  Pick<FurnitureRow, 'name' | 'description' | 'color'>
>;

export type FurnitureUpdateResponse = Pick<
  FurnitureRow,
  'id' | 'name' | 'description' | 'color' | 'updated_at'
>;

// Furniture placements
export type FurniturePlacementGetResponse = FurniturePlacementRow;

export type FurniturePlacementPutRequest = Omit<FurniturePlacementRow, 'furniture_id'>;

export type FurniturePlacementPutResponse = FurniturePlacementRow;

// Items
export type ItemListItem = Pick<ItemRow, 'id' | 'name'>;
export type ItemListResponse = {
  data: ItemListItem[];
  meta?: PaginationMeta;
};

export type ItemCreateInput = Pick<ItemRow, 'name'>;

export type ItemCreateRequest = {
  items: ItemCreateInput[];
};

export type ItemCreateFailure = {
  name: ItemRow['name'];
  error?: string;
};

export type ItemCreateResponse = {
  created: ItemListItem[];
  failed: ItemCreateFailure[];
};

export type ItemRenameRequest = Pick<ItemRow, 'name'>;
export type ItemRenameResponse = Pick<ItemRow, 'id' | 'name' | 'updated_at'>;

// Search
export type SearchItemResult = {
  item_id: ItemRow['id'];
  item_name: ItemRow['name'];
  furniture: Pick<FurnitureRow, 'id' | 'name'>;
  room: Pick<RoomRow, 'id' | 'name'>;
};

export type SearchItemsResponse = {
  data: SearchItemResult[];
};

// Onboarding
export type OnboardingGetResponse = OnboardingRow;
export type OnboardingUpsertRequest = Pick<OnboardingRow, 'completed_at' | 'last_step'>;
export type OnboardingUpsertResponse = OnboardingRow;

// Event logs
export type EventLogCreateRequest = Pick<
  EventLogRow,
  'event_time' | 'message' | 'room_id' | 'furniture_id' | 'item_id'
>;

export type EventLogCreateResponse = Pick<EventLogRow, 'id' | 'message'>;

export type EventLogListItem = Pick<EventLogRow, 'id' | 'message' | 'event_time'>;
export type EventLogListResponse = {
  data: EventLogListItem[];
  meta?: PaginationMeta;
};

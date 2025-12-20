import type { Tables, TablesInsert, TablesUpdate } from './db/database.types';

/**
 * Shared primitives
 */
export type UUID = string;
export type ISODateTime = string;
export type HexColor = `#${string}`;

/**
 * Database entity aliases (strongly typed, derived from Supabase generated types)
 */
export type RoomRow = Tables<'rooms'>;
export type RoomInsert = TablesInsert<'rooms'>;
export type RoomUpdate = TablesUpdate<'rooms'>;

export type FurnitureRow = Tables<'furniture'>;
export type FurnitureInsert = TablesInsert<'furniture'>;
export type FurnitureUpdate = TablesUpdate<'furniture'>;

export type ItemRow = Tables<'items'>;
export type ItemInsert = TablesInsert<'items'>;
export type ItemUpdate = TablesUpdate<'items'>;

export type OnboardingRow = Tables<'onboarding'>;
export type OnboardingInsert = TablesInsert<'onboarding'>;
export type OnboardingUpdate = TablesUpdate<'onboarding'>;

export type EventLogRow = Tables<'event_logs'>;
export type EventLogInsert = TablesInsert<'event_logs'>;
export type EventLogUpdate = TablesUpdate<'event_logs'>;

/**
 * REST DTOs (response shapes)
 *
 * These types match the API plan’s recommended `select=` projections.
 * They intentionally omit user-scoped/internal columns unless needed by the UI.
 */
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

export type FurnitureDto = Pick<
  FurnitureRow,
  | 'id'
  | 'room_id'
  | 'name'
  | 'description'
  | 'color'
  | 'created_at'
  | 'updated_at'
>;

export type ItemDto = Pick<ItemRow, 'id' | 'furniture_id' | 'name' | 'created_at' | 'updated_at'>;

export type OnboardingStateDto = Pick<OnboardingRow, 'user_id' | 'completed_at' | 'last_step'>;

export type EventLogDto = Pick<
  EventLogRow,
  'id' | 'event_time' | 'message' | 'room_id' | 'furniture_id' | 'item_id'
>;

/**
 * Analytics/event taxonomy derived from PRD event list.
 * Stored in `event_logs.message` (string).
 */
export type EventMessage =
  | 'room_created'
  | 'furniture_created'
  | 'item_added'
  | 'search_performed'
  // keep extensible without breaking existing code
  | (string & {});

/**
 * Command models (write payloads)
 *
 * Important:
 * - PostgREST inserts for `rooms`/`furniture`/`items` require `user_id` and `created_by`.
 * - The UI should not let users choose these values; they should be injected from the current session.
 */

// Rooms
export type CreateRoomPayload = Omit<RoomInsert, 'id' | 'created_at' | 'updated_at'>;

/**
 * UI-level command (no auth-scoped fields).
 * The data access layer should add `user_id` and `created_by` (both = auth.uid()).
 */
export type CreateRoomCommand = Omit<CreateRoomPayload, 'user_id' | 'created_by'>;

/**
 * PATCH payload for `/rest/v1/rooms?id=eq.<room_id>`
 * Omits user-scoped/timestamp fields to prevent accidental updates.
 */
export type UpdateRoomCommand = Partial<
  Pick<RoomUpdate, 'name' | 'color' | 'x_start' | 'y_start' | 'width_cells' | 'height_cells' | 'cell_size_m'>
>;

// Furniture
export type CreateFurniturePayload = Omit<FurnitureInsert, 'id' | 'created_at' | 'updated_at'>;
export type CreateFurnitureCommand = Omit<CreateFurniturePayload, 'user_id' | 'created_by'>;

export type UpdateFurnitureCommand = Partial<Pick<FurnitureUpdate, 'name' | 'description' | 'color'>>;

// Items
export type CreateItemPayload = Omit<ItemInsert, 'id' | 'created_at' | 'updated_at'>;
export type CreateItemCommand = Omit<CreateItemPayload, 'user_id' | 'created_by'>;

/**
 * PostgREST bulk insert payload for `/rest/v1/items` (array of inserts).
 */
export type BulkCreateItemsPayload = CreateItemPayload[];

/**
 * UI-level bulk command (matches “+ add multiple inputs” UX).
 * The data access layer expands `names[]` to `BulkCreateItemsPayload` and injects `user_id/created_by`.
 */
export type BulkCreateItemsCommand = {
  furniture_id: ItemRow['furniture_id'];
  names: Array<ItemRow['name']>;
};

// Onboarding
export type InitOnboardingPayload = OnboardingInsert;
export type InitOnboardingCommand = Omit<InitOnboardingPayload, 'user_id'>;

export type UpdateOnboardingCommand = Partial<Pick<OnboardingUpdate, 'completed_at' | 'last_step'>>;

// Event logs
export type CreateEventLogPayload = Omit<EventLogInsert, 'id' | 'event_time'>;
export type CreateEventLogCommand = Omit<CreateEventLogPayload, 'user_id'> & { message: EventMessage };

/**
 * Search DTOs
 *
 * Option A (PostgREST nested select):
 * `/rest/v1/items?select=id,name,furniture:furniture_id(id,name,description,color,room:room_id(id,name,color))`
 */
export type SearchRoomDto = Pick<RoomRow, 'id' | 'name' | 'color'>;

export type SearchFurnitureDto = Pick<FurnitureRow, 'id' | 'name' | 'description' | 'color'> & {
  room: SearchRoomDto;
};

export type ItemSearchMatchDto = Pick<ItemRow, 'id' | 'name'> & {
  furniture: SearchFurnitureDto;
};

/**
 * Option B (Edge Function response)
 * `/functions/v1/search?q=<query>&limit=&offset=`
 */
export type SearchResultGroupDto = {
  furniture: SearchFurnitureDto;
  matchedItems: Array<Pick<ItemRow, 'id' | 'name'>>;
};

export type SearchResponseDto = {
  query: string;
  results: SearchResultGroupDto[];
};

/**
 * Generic list query helpers (PostgREST)
 */
export type ListQuery = {
  limit?: number;
  offset?: number;
  order?: string;
};

/**
 * Standardized client-side error DTO (recommended in API plan).
 * Not derived from a DB entity because it represents HTTP/SDK errors.
 */
export type ApiErrorDto = {
  code: string;
  message: string;
  details?: unknown;
};

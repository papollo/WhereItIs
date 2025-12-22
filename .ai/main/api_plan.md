# REST API Plan

## Assumptions / Notes

- Backend is Supabase (PostgREST + Auth + RLS). The “API” below is primarily the Supabase REST API (`/rest/v1`) plus
  optional Supabase Edge Functions for composite/business endpoints.
- The database schema provided includes: `rooms`, `furniture`, `items`, `onboarding`, `event_logs` (plus policies and
  indexes). There is no persisted “painted grid cells” table/column; this plan treats
  `rooms.width_cells/height_cells/cell_size_m` as the grid definition and recommends storing the painted cells as a
  future schema extension if persistence is required.
- Client uses the Supabase anon key and user JWT; authorization is enforced via RLS. The API must never trust `user_id`
  provided by clients; it must match `auth.uid()` (already enforced by policies/check constraints for inserts/updates).

## 1. Resources

- `Room` → `public.rooms`
- `Furniture` → `public.furniture`
- `Item` → `public.items`
- `OnboardingState` → `public.onboarding`
- `EventLog` → `public.event_logs`

## 2. Endpoint

### Conventions (applies to all endpoints)

- Base URL:
    - PostgREST: `https://<project-ref>.supabase.co/rest/v1`
    - Auth: `https://<project-ref>.supabase.co/auth/v1`
    - Edge Functions (optional): `https://<project-ref>.supabase.co/functions/v1`
- Auth header: `Authorization: Bearer <access_token>` (JWT from Supabase Auth)
- Prefer `Prefer: return=representation` for create/update when the client needs the created/updated row back.
- Pagination (PostgREST):
    - Use query params: `limit`, `offset`
    - Or `Range` header: `Range: 0-49` (recommended for large lists)
- Sorting: `order=<column>.asc|desc`
- Filtering: use PostgREST operators (`eq`, `ilike`, `in`, etc.).
- Error shape (recommended client-side normalization):
    - `{ "code": "string", "message": "string", "details": "any" }`

---

### Authentication (Supabase Auth)

#### Sign up

- HTTP Method: `POST`
- URL Path: `/auth/v1/signup`
- Description: Create a new user account with email + password.
- Query Params: none
- Request JSON:
    - `{ "email": "user@example.com", "password": "strong-password" }`
- Response JSON:
    - Supabase Auth user/session payload (includes `access_token`, `refresh_token` if configured)
- Success:
    - `200 OK`
- Errors:
    - `400 Bad Request` (invalid email/password)
    - `422 Unprocessable Entity` (validation)
    - `429 Too Many Requests` (rate limits)

#### Sign in (password)

- HTTP Method: `POST`
- URL Path: `/auth/v1/token?grant_type=password`
- Description: Authenticate using email + password.
- Query Params:
    - `grant_type=password` (required by Supabase)
- Request JSON:
    - `{ "email": "user@example.com", "password": "strong-password" }`
- Response JSON:
    - `{ "access_token": "jwt", "token_type": "bearer", "expires_in": 3600, "refresh_token": "..." }`
- Success:
    - `200 OK`
- Errors:
    - `400 Bad Request` (invalid credentials)
    - `429 Too Many Requests`

#### Sign out

- HTTP Method: `POST`
- URL Path: `/auth/v1/logout`
- Description: Invalidate the current session (client should also drop tokens locally).
- Query Params: none
- Request JSON: none
- Response JSON: none
- Success:
    - `204 No Content`
- Errors:
    - `401 Unauthorized`

---

### Rooms (`public.rooms`)

#### List rooms

- HTTP Method: `GET`
- URL Path: `/rest/v1/rooms`
- Description: List rooms owned by the authenticated user.
- Query Params (examples):
    - `select=id,name,color,x_start,y_start,width_cells,height_cells,cell_size_m,created_at,updated_at`
    - `order=created_at.desc`
    - `limit=50&offset=0`
    - `name=ilike.*kitchen*` (optional filter)
- Response JSON:
    -
    `[ { "id": "uuid", "name": "Kitchen", "color": "#ffffff", "x_start": 0, "y_start": 0, "width_cells": 40, "height_cells": 40, "cell_size_m": 0.5, "created_at": "...", "updated_at": "..." } ]`
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`

#### Create room

- HTTP Method: `POST`
- URL Path: `/rest/v1/rooms`
- Description: Create a new room.
- Query Params:
    - `select=*` (optional; return created row)
- Request JSON:
    -
    `{ "user_id": "<auth.uid()>", "created_by": "<auth.uid()>", "name": "Kitchen", "color": "#aabbcc", "x_start": 0, "y_start": 0, "width_cells": 40, "height_cells": 40, "cell_size_m": 0.5 }`
- Response JSON:
    - `[ { "id": "uuid", ... } ]`
- Success:
    - `201 Created` (or `200 OK` depending on client/Prefer headers)
- Errors:
    - `400 Bad Request` (malformed JSON)
    - `401 Unauthorized`
    - `409 Conflict` (room name already exists for user due to `rooms_user_name_lower_uidx`)
    - `422 Unprocessable Entity` (check constraint violations: name length, color hex, cell size, dimensions)

#### Get room by id

- HTTP Method: `GET`
- URL Path: `/rest/v1/rooms`
- Description: Fetch a single room by id.
- Query Params:
    - `id=eq.<room_id>`
    - `select=*`
- Response JSON:
    - `[ { "id": "uuid", ... } ]` (PostgREST returns arrays; client should expect 0/1 row)
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`

#### Update room

- HTTP Method: `PATCH`
- URL Path: `/rest/v1/rooms`
- Description: Update room metadata (name/color/grid definition).
- Query Params:
    - `id=eq.<room_id>`
    - `select=*` (optional)
- Request JSON (example):
    - `{ "name": "Kitchen (new)", "color": "#112233" }`
- Response JSON:
    - `[ { "id": "uuid", ... } ]`
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`
    - `409 Conflict` (name uniqueness)
    - `422 Unprocessable Entity` (constraints)

#### Delete room

- HTTP Method: `DELETE`
- URL Path: `/rest/v1/rooms`
- Description: Delete a room (cascades to furniture and items via FK `on delete cascade`).
- Query Params:
    - `id=eq.<room_id>`
- Response JSON: none (or `[]` depending on Prefer)
- Success:
    - `204 No Content`
- Errors:
    - `401 Unauthorized`

---

### Furniture (`public.furniture`)

#### List furniture in a room

- HTTP Method: `GET`
- URL Path: `/rest/v1/furniture`
- Description: List furniture in a given room.
- Query Params:
    - `room_id=eq.<room_id>`
    - `select=id,room_id,name,description,color,created_at,updated_at`
    - `order=created_at.asc`
    - `limit=100&offset=0`
- Response JSON:
    - `[ { "id": "uuid", "room_id": "uuid", "name": "Cabinet", "description": "…", "color": "#ffffff", ... } ]`
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`

#### Create furniture

- HTTP Method: `POST`
- URL Path: `/rest/v1/furniture`
- Description: Add furniture to a room.
- Query Params:
    - `select=*` (optional)
- Request JSON:
    -
    `{ "room_id": "<room_id>", "user_id": "<auth.uid()>", "created_by": "<auth.uid()>", "name": "Cabinet", "description": "Short description", "color": "#445566" }`
- Response JSON:
    - `[ { "id": "uuid", ... } ]`
- Success:
    - `201 Created`
- Errors:
    - `401 Unauthorized`
    - `409 Conflict` (unique per room: `furniture_room_name_lower_uidx`)
    - `422 Unprocessable Entity` (constraints: name length, description length, color format)

#### Update furniture

- HTTP Method: `PATCH`
- URL Path: `/rest/v1/furniture`
- Description: Update furniture fields.
- Query Params:
    - `id=eq.<furniture_id>`
    - `select=*` (optional)
- Request JSON:
    - `{ "name": "Cabinet (new)", "description": null, "color": "#ffffff" }`
- Response JSON:
    - `[ { "id": "uuid", ... } ]`
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`
    - `409 Conflict`
    - `422 Unprocessable Entity`

#### Delete furniture

- HTTP Method: `DELETE`
- URL Path: `/rest/v1/furniture`
- Description: Delete furniture (cascades to items).
- Query Params:
    - `id=eq.<furniture_id>`
- Response JSON: none
- Success:
    - `204 No Content`
- Errors:
    - `401 Unauthorized`

---

### Items (`public.items`)

#### List items on a furniture

- HTTP Method: `GET`
- URL Path: `/rest/v1/items`
- Description: List items assigned to a specific furniture.
- Query Params:
    - `furniture_id=eq.<furniture_id>`
    - `select=id,furniture_id,name,created_at,updated_at`
    - `order=created_at.desc`
    - `limit=200&offset=0`
- Response JSON:
    - `[ { "id": "uuid", "furniture_id": "uuid", "name": "Batteries", ... } ]`
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`

#### Add a single item

- HTTP Method: `POST`
- URL Path: `/rest/v1/items`
- Description: Create one item under a furniture.
- Query Params:
    - `select=*` (optional)
- Request JSON:
    -
    `{ "furniture_id": "<furniture_id>", "user_id": "<auth.uid()>", "created_by": "<auth.uid()>", "name": "Batteries" }`
- Response JSON:
    - `[ { "id": "uuid", ... } ]`
- Success:
    - `201 Created`
- Errors:
    - `401 Unauthorized`
    - `422 Unprocessable Entity` (name length, FK constraints, RLS)

#### Bulk add items (for “+ add multiple inputs” UX)

- HTTP Method: `POST`
- URL Path: `/rest/v1/items`
- Description: Bulk insert multiple items in one request.
- Query Params:
    - `select=id,furniture_id,name,created_at` (optional)
- Request JSON (array):
    -
    `[{ "furniture_id": "<furniture_id>", "user_id": "<auth.uid()>", "created_by": "<auth.uid()>", "name": "Batteries" }, { "furniture_id": "<furniture_id>", "user_id": "<auth.uid()>", "created_by": "<auth.uid()>", "name": "Tape" }]`
- Response JSON:
    - `[ { "id": "uuid", ... }, { "id": "uuid", ... } ]`
- Success:
    - `201 Created`
- Errors:
    - `401 Unauthorized`
    - `422 Unprocessable Entity`

#### Delete item

- HTTP Method: `DELETE`
- URL Path: `/rest/v1/items`
- Description: Delete a single item.
- Query Params:
    - `id=eq.<item_id>`
- Response JSON: none
- Success:
    - `204 No Content`
- Errors:
    - `401 Unauthorized`

---

### Search (business endpoint)

Goal: “search item by name → return furniture list containing the item; clicking navigates to room + furniture”.

#### Option A (recommended for MVP): PostgREST query on `items` with nested selects

- HTTP Method: `GET`
- URL Path: `/rest/v1/items`
- Description: Search items by name (trigram index exists on `lower(name)`), returning nested furniture + room context.
- Query Params (example):
    - `select=id,name,furniture:furniture_id(id,name,description,color,room:room_id(id,name,color))`
    - `name=ilike.*<query>*`
    - `order=updated_at.desc`
    - `limit=50&offset=0`
- Response JSON (example):
    -
    `[ { "id": "uuid", "name": "Batteries", "furniture": { "id": "uuid", "name": "Cabinet", "room": { "id": "uuid", "name": "Kitchen" } } } ]`
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`

Why: No extra backend code, uses existing trigram index, leverages RLS automatically.

#### Option B (scalable/controlled): Edge Function `/functions/v1/search`

- HTTP Method: `GET`
- URL Path: `/functions/v1/search`
- Description: Search with custom ranking, deduplication (e.g., group by furniture), and stable response shape.
- Query Params:
    - `q=<query>`
    - `limit=50&offset=0`
- Response JSON:
    -
    `{ "query": "bat", "results": [ { "furniture": { "id": "uuid", "name": "Cabinet", "room": { "id": "uuid", "name": "Kitchen" } }, "matchedItems": [ { "id": "uuid", "name": "Batteries" } ] } ] }`
- Success:
    - `200 OK`
- Errors:
    - `400 Bad Request` (missing `q`)
    - `401 Unauthorized`
    - `429 Too Many Requests`

Why/when: Prefer when you need strict response shapes, rate limiting, caching, and richer search logic.

---

### Onboarding (`public.onboarding`)

#### Get onboarding state

- HTTP Method: `GET`
- URL Path: `/rest/v1/onboarding`
- Description: Get the user’s onboarding state.
- Query Params:
    - `select=user_id,completed_at,last_step`
- Response JSON:
    - `[ { "user_id": "uuid", "completed_at": null, "last_step": "welcome" } ]` (or empty array if not created yet)
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`

#### Initialize onboarding state (first login)

- HTTP Method: `POST`
- URL Path: `/rest/v1/onboarding`
- Description: Create onboarding row for the user (idempotency can be handled client-side by checking existence first).
- Query Params:
    - `select=*` (optional)
- Request JSON:
    - `{ "user_id": "<auth.uid()>", "completed_at": null, "last_step": "welcome" }`
- Response JSON:
    - `[ { "user_id": "uuid", ... } ]`
- Success:
    - `201 Created`
- Errors:
    - `401 Unauthorized`
    - `409 Conflict` (if already exists; primary key `user_id`)

#### Update onboarding progress / completion

- HTTP Method: `PATCH`
- URL Path: `/rest/v1/onboarding`
- Description: Update onboarding state; mark completion by setting `completed_at`.
- Query Params:
    - `user_id=eq.<auth.uid()>`
    - `select=*` (optional)
- Request JSON (examples):
    - `{ "last_step": "search" }`
    - `{ "completed_at": "2025-12-18T12:00:00Z", "last_step": "done" }`
- Response JSON:
    - `[ { "user_id": "uuid", ... } ]`
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`

---

### Event logs (`public.event_logs`)

#### Create event log entry

- HTTP Method: `POST`
- URL Path: `/rest/v1/event_logs`
- Description: Record analytics/monitoring events (`room_created`, `furniture_created`, `item_added`,
  `search_performed`).
- Query Params:
    - `select=id,event_time` (optional)
- Request JSON:
    -
    `{ "user_id": "<auth.uid()>", "room_id": "<room_id|null>", "furniture_id": "<furniture_id|null>", "item_id": "<item_id|null>", "message": "room_created" }`
- Response JSON:
    - `[ { "id": 123, "event_time": "..." } ]`
- Success:
    - `201 Created`
- Errors:
    - `401 Unauthorized`
    - `422 Unprocessable Entity` (message length constraint, FK checks)

#### List event logs (optional/admin UX)

- HTTP Method: `GET`
- URL Path: `/rest/v1/event_logs`
- Description: List events for the authenticated user (read-only for users by policy).
- Query Params:
    - `select=id,event_time,message,room_id,furniture_id,item_id`
    - `order=event_time.desc`
    - `limit=100&offset=0`
    - `event_time=gte.<iso>&event_time=lte.<iso>` (optional time window)
- Response JSON:
    - `[ { "id": 123, "event_time": "...", "message": "search_performed", "room_id": null, ... } ]`
- Success:
    - `200 OK`
- Errors:
    - `401 Unauthorized`

---

### “Painted grid cells” (schema gap; recommended extension)

If cell painting must persist server-side, add one of:

1) `room_cells(room_id, x, y, color)` with `(room_id, x, y)` unique index, or
2) `rooms.layout jsonb` storing a compressed representation.

Then expose endpoints:

- `GET /rest/v1/room_cells?room_id=eq.<room_id>&select=x,y,color`
- `PUT /functions/v1/rooms/<room_id>/layout` (edge function for bulk upsert + validation)

## 3. Authentication and Authorization

- Authentication: Supabase Auth (email + password) issuing JWTs.
- Authorization: Supabase RLS enforced on all tables:
    - Users can only `select/insert/update/delete` rows where `user_id = auth.uid()` (per the policies).
    - Insert checks require `created_by = auth.uid()` for `rooms`/`furniture`/`items` (and `created_by = user_id` for
      rooms/furniture updates).
- Roles:
    - End users: `authenticated` (standard JWT)
    - Operational/admin tasks: `service_role` (never used in the Angular client; only in trusted server contexts).

## 4. Validation and Business Logic

### Validation rules (from schema constraints)

- `rooms`
    - `name`: non-empty, max 120 chars; unique per user (case-insensitive).
    - `x_start`, `y_start`: `>= 0`.
    - `width_cells`, `height_cells`: integers `1..50`.
    - `cell_size_m`: must equal `0.5`.
    - `color`: must match `^#[0-9a-fA-F]{6}$`.
    - `created_by` must equal `user_id`; both must equal `auth.uid()` on insert.
- `furniture`
    - `name`: non-empty, max 150 chars; unique per room (case-insensitive).
    - `description`: nullable, max 500 chars.
    - `color`: hex `#RRGGBB`.
    - `created_by` must equal `user_id`; both must equal `auth.uid()` on insert.
- `items`
    - `name`: non-empty, max 200 chars; duplicates allowed.
    - `created_by`: required; insert policy requires `created_by = auth.uid()`.
- `event_logs`
    - `message`: non-empty, max 500 chars.
    - Records are append-only for users (no update/delete).

### Business logic mapping (from PRD)

- Room CRUD (create/edit/delete) → `rooms` endpoints.
- Furniture CRUD + “modal with items” → `furniture` endpoints plus `items` list/create/delete.
- “Add many items in modal” → `items` bulk insert.
- Search “by item name → show furniture list → navigate to room/furniture” → Search option A (PostgREST nested select)
  or option B (Edge Function).
- Onboarding first login + restart from settings → `onboarding` read/init/update.
- Monitoring events (`room_created`, `furniture_created`, `item_added`, `search_performed`) → `event_logs` insert;
  prefer logging after successful writes/search responses.
- Error handling UI toast → normalize non-2xx responses into user-friendly messages; show a generic message for 5xx and
  a validation message for 4xx/422.

### Security and performance considerations

- Enforce privacy via RLS (already enabled and forced on all tables).
- Use the trigram index (`items_name_trgm_idx`) for fast substring search; always search on `lower(name)` with `ilike`.
- Rate limiting:
    - Rely on Supabase platform limits for baseline protection.
    - If stronger controls are needed (e.g., for search), route through an Edge Function and apply per-user throttling.
- Data retention:
    - `event_logs` are purged automatically after 30 days (scheduled via `pg_cron`), keeping analytics storage bounded.

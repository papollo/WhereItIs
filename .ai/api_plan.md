# REST API Plan

## 1. Resources

- Rooms -> `rooms`
- Room cells (room shape) -> `room_cells`
- Furniture -> `furniture`
- Furniture placements -> `furniture_placements`
- Items -> `items`
- Onboarding -> `onboarding`
- Event logs (monitoring) -> `event_logs`

## 2. Endpoints

### Auth (Supabase Auth)

- POST `/auth/signup`
  - Description: Create a new account (email + password)
  - Request JSON
    ```json
    { "email": "user@example.com", "password": "strong-password" }
    ```
  - Response JSON
    ```json
    { "user": { "id": "uuid", "email": "user@example.com" }, "session": { "access_token": "..." } }
    ```
  - Success: 201 Created
  - Errors: 400 Invalid input, 409 Email exists

- POST `/auth/login`
  - Description: Authenticate and obtain session token
  - Request JSON
    ```json
    { "email": "user@example.com", "password": "strong-password" }
    ```
  - Response JSON
    ```json
    { "access_token": "...", "refresh_token": "...", "user": { "id": "uuid" } }
    ```
  - Success: 200 OK
  - Errors: 401 Invalid credentials

- POST `/auth/forgot-password`
  - Description: Send password reset link to email
  - Request JSON
    ```json
    { "email": "user@example.com" }
    ```
  - Response JSON
    ```json
    { "message": "reset email sent" }
    ```
  - Success: 200 OK
  - Errors: 400 Invalid input, 404 Email not found

- POST `/auth/reset-password`
  - Description: Set a new password using reset token (from email link)
  - Request JSON
    ```json
    { "access_token": "...", "password": "new-strong-password" }
    ```
  - Response JSON
    ```json
    { "message": "password updated" }
    ```
  - Success: 200 OK
  - Errors: 400 Invalid input or expired token

- POST `/auth/logout`
  - Description: Revoke current session token
  - Request JSON: none
  - Response JSON
    ```json
    { "message": "logged out" }
    ```
  - Success: 200 OK

### Rooms

- GET `/rooms`
  - Description: List user rooms
  - Query params: `limit`, `offset`, `sort` (e.g., `created_at:desc`), `q` (optional name filter)
  - Response JSON
    ```json
    { "data": [ { "id": "uuid", "name": "Kitchen", "color": "#ffffff" } ], "meta": { "limit": 20, "offset": 0, "total": 1 } }
    ```
  - Success: 200 OK

- POST `/rooms`
  - Description: Create a room
  - Request JSON
    ```json
    { "name": "Kitchen", "color": "#ffffff" }
    ```
  - Response JSON
    ```json
    { "id": "uuid", "name": "Kitchen", "color": "#ffffff", "created_at": "..." }
    ```
  - Success: 201 Created
  - Errors: 400 Validation error, 409 Name already exists

- GET `/rooms/{roomId}`
  - Description: Get room details
  - Response JSON
    ```json
    { "id": "uuid", "name": "Kitchen", "color": "#ffffff", "created_at": "...", "updated_at": "..." }
    ```
  - Success: 200 OK
  - Errors: 404 Not found

- PATCH `/rooms/{roomId}`
  - Description: Update room name or color
  - Request JSON
    ```json
    { "name": "New name", "color": "#ff00aa" }
    ```
  - Response JSON
    ```json
    { "id": "uuid", "name": "New name", "color": "#ff00aa", "updated_at": "..." }
    ```
  - Success: 200 OK
  - Errors: 400 Validation error, 409 Name already exists, 404 Not found

- DELETE `/rooms/{roomId}`
  - Description: Delete a room with cascading furniture and items
  - Response JSON
    ```json
    { "message": "deleted" }
    ```
  - Success: 204 No Content
  - Errors: 404 Not found

### Room Cells

- GET `/rooms/{roomId}/cells`
  - Description: Fetch room shape cells
  - Response JSON
    ```json
    { "room_id": "uuid", "cells": [ { "x": 0, "y": 0 }, { "x": 1, "y": 0 } ] }
    ```
  - Success: 200 OK

- PUT `/rooms/{roomId}/cells`
  - Description: Replace room shape with a complete set of cells (painted grid)
  - Request JSON
    ```json
    { "cells": [ { "x": 0, "y": 0 }, { "x": 1, "y": 0 } ] }
    ```
  - Response JSON
    ```json
    { "room_id": "uuid", "cells_saved": 2 }
    ```
  - Success: 200 OK
  - Errors: 400 Validation error

### Furniture

- GET `/rooms/{roomId}/furniture`
  - Description: List furniture in a room
  - Query params: `limit`, `offset`, `sort`, `q` (optional name filter)
  - Response JSON
    ```json
    { "data": [ { "id": "uuid", "name": "Cabinet", "color": "#cccccc" } ] }
    ```
  - Success: 200 OK

- POST `/rooms/{roomId}/furniture`
  - Description: Create furniture in a room
  - Request JSON
    ```json
    { "name": "Cabinet", "description": "Top shelf", "color": "#cccccc" }
    ```
  - Response JSON
    ```json
    { "id": "uuid", "room_id": "uuid", "name": "Cabinet", "color": "#cccccc" }
    ```
  - Success: 201 Created
  - Errors: 400 Validation error, 409 Name already exists

- GET `/furniture/{furnitureId}`
  - Description: Get furniture details
  - Response JSON
    ```json
    { "id": "uuid", "room_id": "uuid", "name": "Cabinet", "description": "Top shelf", "color": "#cccccc" }
    ```
  - Success: 200 OK
  - Errors: 404 Not found

- PATCH `/furniture/{furnitureId}`
  - Description: Update furniture fields
  - Request JSON
    ```json
    { "name": "Cabinet", "description": "Updated", "color": "#aabbcc" }
    ```
  - Response JSON
    ```json
    { "id": "uuid", "name": "Cabinet", "description": "Updated", "color": "#aabbcc", "updated_at": "..." }
    ```
  - Success: 200 OK
  - Errors: 400 Validation error, 409 Name already exists, 404 Not found

- DELETE `/furniture/{furnitureId}`
  - Description: Delete furniture with cascading items
  - Response JSON
    ```json
    { "message": "deleted" }
    ```
  - Success: 204 No Content
  - Errors: 404 Not found

### Furniture Placements

- GET `/furniture/{furnitureId}/placement`
  - Description: Get placement for furniture
  - Response JSON
    ```json
    { "furniture_id": "uuid", "room_id": "uuid", "x": 0, "y": 0, "width_cells": 2, "height_cells": 3 }
    ```
  - Success: 200 OK

- PUT `/furniture/{furnitureId}/placement`
  - Description: Upsert placement for furniture
  - Request JSON
    ```json
    { "room_id": "uuid", "x": 0, "y": 0, "width_cells": 2, "height_cells": 3 }
    ```
  - Response JSON
    ```json
    { "furniture_id": "uuid", "room_id": "uuid", "x": 0, "y": 0, "width_cells": 2, "height_cells": 3 }
    ```
  - Success: 200 OK
  - Errors: 400 Validation error, 404 Not found

### Items

- GET `/furniture/{furnitureId}/items`
  - Description: List items in furniture
  - Query params: `limit`, `offset`, `sort`, `q` (optional name filter)
  - Response JSON
    ```json
    { "data": [ { "id": "uuid", "name": "Spare keys" } ] }
    ```
  - Success: 200 OK

- POST `/furniture/{furnitureId}/items`
  - Description: Create one or many items
  - Request JSON
    ```json
    { "items": [ { "name": "Spare keys" }, { "name": "Batteries" } ] }
    ```
  - Response JSON
    ```json
    { "created": [ { "id": "uuid", "name": "Spare keys" } ], "failed": [] }
    ```
  - Success: 201 Created
  - Errors: 400 Validation error

- PATCH `/items/{itemId}`
  - Description: Rename item
  - Request JSON
    ```json
    { "name": "New name" }
    ```
  - Response JSON
    ```json
    { "id": "uuid", "name": "New name", "updated_at": "..." }
    ```
  - Success: 200 OK
  - Errors: 400 Validation error, 404 Not found

- DELETE `/items/{itemId}`
  - Description: Delete item
  - Response JSON
    ```json
    { "message": "deleted" }
    ```
  - Success: 204 No Content
  - Errors: 404 Not found

### Search

- GET `/search/items`
  - Description: Search items by name and return furniture + room context
  - Query params: `q` (required), `limit`, `offset`, `sort` (default: relevance)
  - Response JSON
    ```json
    {
      "data": [
        {
          "item_id": "uuid",
          "item_name": "Spare keys",
          "furniture": { "id": "uuid", "name": "Cabinet" },
          "room": { "id": "uuid", "name": "Kitchen" }
        }
      ]
    }
    ```
  - Success: 200 OK
  - Errors: 400 Missing query

### Onboarding

- GET `/onboarding`
  - Description: Get onboarding state for current user
  - Response JSON
    ```json
    { "user_id": "uuid", "completed_at": null, "last_step": "intro" }
    ```
  - Success: 200 OK

- PUT `/onboarding`
  - Description: Create or update onboarding state
  - Request JSON
    ```json
    { "completed_at": "2025-01-01T12:00:00Z", "last_step": "done" }
    ```
  - Response JSON
    ```json
    { "user_id": "uuid", "completed_at": "2025-01-01T12:00:00Z", "last_step": "done" }
    ```
  - Success: 200 OK

### Event Logs

- POST `/event-logs`
  - Description: Record event (room_created, furniture_created, item_added, search_performed)
  - Request JSON
    ```json
    { "event_time": "2025-01-01T12:00:00Z", "message": "room_created", "room_id": "uuid" }
    ```
  - Response JSON
    ```json
    { "id": 1, "message": "room_created" }
    ```
  - Success: 201 Created
  - Errors: 400 Validation error

- GET `/event-logs`
  - Description: List user events for analytics (optional for UI/admin)
  - Query params: `limit`, `offset`, `sort` (default: event_time:desc)
  - Response JSON
    ```json
    { "data": [ { "id": 1, "message": "room_created", "event_time": "..." } ] }
    ```
  - Success: 200 OK

## 3. Authentication and Authorization

- Authentication: Supabase Auth (email + password), returns JWT access token.
- Authorization: Supabase Row Level Security (RLS) ensures users access only their own rows.
- Roles:
  - `anon`: no access to private data.
  - `authenticated`: access limited to own data by RLS.
  - `service_role`: allowed for system operations (e.g., event log cleanup, AI-created items).
- All endpoints require a valid bearer token except `/auth/*`.

## 4. Validation and Business Logic

### Validation rules (derived from schema)

- rooms
  - `name`: required, 1..120 chars
  - `color`: `^#[0-9a-fA-F]{6}$`
- room_cells
  - `x`, `y`: integers in 0..49
  - no duplicate `(room_id, x, y)`
- furniture
  - `name`: required, 1..150 chars
  - `description`: optional, max 500 chars
  - `color`: `^#[0-9a-fA-F]{6}$`
- furniture_placements
  - `x`, `y`: integers in 0..49
  - `width_cells`, `height_cells`: 1..50
- items
  - `name`: required, 1..200 chars
  - `created_by`: user id or service role id
- onboarding
  - `last_step`: optional string
- event_logs
  - `message`: required, 1..500 chars

### Business logic mapping

- Room creation/editing: update `rooms`, then update `room_cells` to paint grid.
- Room deletion: cascade deletes furniture and items (database handles).
- Furniture modal: use `/furniture/{id}` + `/furniture/{id}/items` to load and manage items.
- Batch item add: POST `/furniture/{id}/items` with list of names.
- Search: `/search/items` uses trigram index on `items.name`, returns furniture + room context.
- Onboarding: `/onboarding` is created on first login; settings can reset by clearing `completed_at`.
- Monitoring: POST `/event-logs` on key actions; service role can purge old logs.

### Performance and safety

- List endpoints use pagination (`limit`, `offset`) and optional name filters.
- Unique name constraints enforced for rooms (per user) and furniture (per room).
- App-side checks:
  - furniture placements must fit within room cells.
  - no furniture overlap within a room (validated in API or database trigger).
  - room cells form a valid shape in 0..49 grid.

-- purpose: create core schema for rooms, furniture, items, onboarding, and event logs
-- affected tables: rooms, room_cells, furniture, furniture_placements, items, onboarding, event_logs
-- special notes: enables rls everywhere; adds per-role policies; uses pg_trgm for items search

-- enable pg_trgm for trigram search indexes on items.name
create extension if not exists pg_trgm;

-- shared trigger function to keep updated_at consistent on write
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- rooms: top-level container owned by a user
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) > 0 and char_length(name) <= 120),
  color text not null default '#ffffff' check (color ~ '^#[0-9a-fa-f]{6}$'),
  created_by uuid not null references auth.users(id) check (created_by = user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enforce unique room names per user and speed up user-scoped reads
create unique index if not exists rooms_user_id_name_unique
  on public.rooms (user_id, lower(name));

create index if not exists rooms_user_id_idx
  on public.rooms (user_id);

-- keep updated_at in sync on updates
create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

alter table public.rooms enable row level security;

-- rooms policies: anon role blocked from all access
-- rationale: rooms are private per user
create policy rooms_select_anon on public.rooms
  for select to anon
  using (false);

-- rationale: anon users cannot create rooms
create policy rooms_insert_anon on public.rooms
  for insert to anon
  with check (false);

-- rationale: anon users cannot update rooms
create policy rooms_update_anon on public.rooms
  for update to anon
  using (false);

-- rationale: anon users cannot delete rooms
create policy rooms_delete_anon on public.rooms
  for delete to anon
  using (false);

-- rooms policies: authenticated users access only their own rooms
-- rationale: users can only read their own rooms
create policy rooms_select_authenticated on public.rooms
  for select to authenticated
  using (user_id = auth.uid());

-- rationale: users can only insert rooms for themselves and must be creator
create policy rooms_insert_authenticated on public.rooms
  for insert to authenticated
  with check (user_id = auth.uid() and created_by = auth.uid());

-- rationale: users can only update their own rooms
create policy rooms_update_authenticated on public.rooms
  for update to authenticated
  using (user_id = auth.uid());

-- rationale: users can only delete their own rooms
create policy rooms_delete_authenticated on public.rooms
  for delete to authenticated
  using (user_id = auth.uid());

-- room_cells: grid cells that define the room shape
create table if not exists public.room_cells (
  room_id uuid not null references public.rooms(id) on delete cascade,
  x integer not null check (x between 0 and 49),
  y integer not null check (y between 0 and 49),
  primary key (room_id, x, y)
);

-- index for fast filtering by room
create index if not exists room_cells_room_id_idx
  on public.room_cells (room_id);

alter table public.room_cells enable row level security;

-- room_cells policies: anon role blocked from all access
-- rationale: room shapes are private per user
create policy room_cells_select_anon on public.room_cells
  for select to anon
  using (false);

-- rationale: anon users cannot insert cells
create policy room_cells_insert_anon on public.room_cells
  for insert to anon
  with check (false);

-- rationale: anon users cannot update cells
create policy room_cells_update_anon on public.room_cells
  for update to anon
  using (false);

-- rationale: anon users cannot delete cells
create policy room_cells_delete_anon on public.room_cells
  for delete to anon
  using (false);

-- room_cells policies: authenticated users only for rooms they own
-- rationale: users can read cells for rooms they own
create policy room_cells_select_authenticated on public.room_cells
  for select to authenticated
  using (room_id in (select id from public.rooms where user_id = auth.uid()));

-- rationale: users can insert cells only for rooms they own
create policy room_cells_insert_authenticated on public.room_cells
  for insert to authenticated
  with check (room_id in (select id from public.rooms where user_id = auth.uid()));

-- rationale: users can update cells only for rooms they own
create policy room_cells_update_authenticated on public.room_cells
  for update to authenticated
  using (room_id in (select id from public.rooms where user_id = auth.uid()));

-- rationale: users can delete cells only for rooms they own
create policy room_cells_delete_authenticated on public.room_cells
  for delete to authenticated
  using (room_id in (select id from public.rooms where user_id = auth.uid()));

-- furniture: user-owned objects placed in rooms
create table if not exists public.furniture (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) > 0 and char_length(name) <= 150),
  description text null check (char_length(description) <= 500),
  color text not null default '#ffffff' check (color ~ '^#[0-9a-fa-f]{6}$'),
  created_by uuid not null references auth.users(id) check (created_by = user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enforce unique furniture names per room and keep lookups fast
create unique index if not exists furniture_room_id_name_unique
  on public.furniture (room_id, lower(name));

create index if not exists furniture_room_id_idx
  on public.furniture (room_id);

create index if not exists furniture_user_id_idx
  on public.furniture (user_id);

-- keep updated_at in sync on updates
create trigger furniture_set_updated_at
  before update on public.furniture
  for each row execute function public.set_updated_at();

alter table public.furniture enable row level security;

-- furniture policies: anon role blocked from all access
-- rationale: furniture is private per user
create policy furniture_select_anon on public.furniture
  for select to anon
  using (false);

-- rationale: anon users cannot insert furniture
create policy furniture_insert_anon on public.furniture
  for insert to anon
  with check (false);

-- rationale: anon users cannot update furniture
create policy furniture_update_anon on public.furniture
  for update to anon
  using (false);

-- rationale: anon users cannot delete furniture
create policy furniture_delete_anon on public.furniture
  for delete to anon
  using (false);

-- furniture policies: authenticated users access only their own furniture
-- rationale: users can read their own furniture only
create policy furniture_select_authenticated on public.furniture
  for select to authenticated
  using (user_id = auth.uid());

-- rationale: users can insert furniture only for themselves and must be creator
create policy furniture_insert_authenticated on public.furniture
  for insert to authenticated
  with check (user_id = auth.uid() and created_by = auth.uid());

-- rationale: users can update their own furniture only
create policy furniture_update_authenticated on public.furniture
  for update to authenticated
  using (user_id = auth.uid());

-- rationale: users can delete their own furniture only
create policy furniture_delete_authenticated on public.furniture
  for delete to authenticated
  using (user_id = auth.uid());

-- furniture_placements: geometry for furniture inside a room
create table if not exists public.furniture_placements (
  furniture_id uuid primary key references public.furniture(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  x integer not null check (x between 0 and 49),
  y integer not null check (y between 0 and 49),
  width_cells integer not null check (width_cells between 1 and 50),
  height_cells integer not null check (height_cells between 1 and 50)
);

-- indexes for common room and furniture lookups
create index if not exists furniture_placements_room_id_idx
  on public.furniture_placements (room_id);

create index if not exists furniture_placements_furniture_id_idx
  on public.furniture_placements (furniture_id);

alter table public.furniture_placements enable row level security;

-- furniture_placements policies: anon role blocked from all access
-- rationale: placements are private per user
create policy furniture_placements_select_anon on public.furniture_placements
  for select to anon
  using (false);

-- rationale: anon users cannot insert placements
create policy furniture_placements_insert_anon on public.furniture_placements
  for insert to anon
  with check (false);

-- rationale: anon users cannot update placements
create policy furniture_placements_update_anon on public.furniture_placements
  for update to anon
  using (false);

-- rationale: anon users cannot delete placements
create policy furniture_placements_delete_anon on public.furniture_placements
  for delete to anon
  using (false);

-- furniture_placements policies: authenticated users access only their rooms
-- rationale: users can read placements only within their rooms
create policy furniture_placements_select_authenticated on public.furniture_placements
  for select to authenticated
  using (room_id in (select id from public.rooms where user_id = auth.uid()));

-- rationale: users can insert placements only within their rooms
create policy furniture_placements_insert_authenticated on public.furniture_placements
  for insert to authenticated
  with check (room_id in (select id from public.rooms where user_id = auth.uid()));

-- rationale: users can update placements only within their rooms
create policy furniture_placements_update_authenticated on public.furniture_placements
  for update to authenticated
  using (room_id in (select id from public.rooms where user_id = auth.uid()));

-- rationale: users can delete placements only within their rooms
create policy furniture_placements_delete_authenticated on public.furniture_placements
  for delete to authenticated
  using (room_id in (select id from public.rooms where user_id = auth.uid()));

-- items: child entities for furniture
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  furniture_id uuid not null references public.furniture(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) > 0 and char_length(name) <= 200),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable trigram search on item names and speed up joins
create index if not exists items_name_trgm_idx
  on public.items using gin (lower(name) gin_trgm_ops);

create index if not exists items_furniture_id_idx
  on public.items (furniture_id);

create index if not exists items_user_id_idx
  on public.items (user_id);

-- keep updated_at in sync on updates
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

alter table public.items enable row level security;

-- items policies: anon role blocked from all access
-- rationale: items are private per user
create policy items_select_anon on public.items
  for select to anon
  using (false);

-- rationale: anon users cannot insert items
create policy items_insert_anon on public.items
  for insert to anon
  with check (false);

-- rationale: anon users cannot update items
create policy items_update_anon on public.items
  for update to anon
  using (false);

-- rationale: anon users cannot delete items
create policy items_delete_anon on public.items
  for delete to anon
  using (false);

-- items policies: authenticated users access their own items; service role may insert
-- rationale: users can read items they own
create policy items_select_authenticated on public.items
  for select to authenticated
  using (user_id = auth.uid());

-- rationale: users can insert items for themselves; service role allowed for ai/service inserts
create policy items_insert_authenticated on public.items
  for insert to authenticated
  with check (user_id = auth.uid() or auth.role() = 'service_role');

-- rationale: users can update their own items only
create policy items_update_authenticated on public.items
  for update to authenticated
  using (user_id = auth.uid());

-- rationale: users can delete their own items only
create policy items_delete_authenticated on public.items
  for delete to authenticated
  using (user_id = auth.uid());

-- onboarding: single row per user to track progress
create table if not exists public.onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_at timestamptz null,
  last_step text null
);

alter table public.onboarding enable row level security;

-- onboarding policies: anon role blocked from all access
-- rationale: onboarding state is private
create policy onboarding_select_anon on public.onboarding
  for select to anon
  using (false);

-- rationale: anon users cannot insert onboarding rows
create policy onboarding_insert_anon on public.onboarding
  for insert to anon
  with check (false);

-- rationale: anon users cannot update onboarding rows
create policy onboarding_update_anon on public.onboarding
  for update to anon
  using (false);

-- rationale: anon users cannot delete onboarding rows
create policy onboarding_delete_anon on public.onboarding
  for delete to anon
  using (false);

-- onboarding policies: authenticated users access only their own row
-- rationale: users can read their own onboarding row
create policy onboarding_select_authenticated on public.onboarding
  for select to authenticated
  using (user_id = auth.uid());

-- rationale: users can create only their own onboarding row
create policy onboarding_insert_authenticated on public.onboarding
  for insert to authenticated
  with check (user_id = auth.uid());

-- rationale: users can update only their own onboarding row
create policy onboarding_update_authenticated on public.onboarding
  for update to authenticated
  using (user_id = auth.uid());

-- rationale: users can delete only their own onboarding row
create policy onboarding_delete_authenticated on public.onboarding
  for delete to authenticated
  using (user_id = auth.uid());

-- event_logs: audit trail for user activity
create table if not exists public.event_logs (
  id bigserial primary key,
  event_time timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid null references public.rooms(id) on delete set null,
  furniture_id uuid null references public.furniture(id) on delete set null,
  item_id uuid null references public.items(id) on delete set null,
  message text not null check (char_length(message) > 0 and char_length(message) <= 500)
);

-- indexes for retention cleanup and user activity queries
create index if not exists event_logs_user_id_idx
  on public.event_logs (user_id);

create index if not exists event_logs_event_time_idx
  on public.event_logs (event_time);

alter table public.event_logs enable row level security;

-- event_logs policies: anon role blocked from all access
-- rationale: event logs are private per user
create policy event_logs_select_anon on public.event_logs
  for select to anon
  using (false);

-- rationale: anon users cannot insert event logs
create policy event_logs_insert_anon on public.event_logs
  for insert to anon
  with check (false);

-- rationale: anon users cannot update event logs
create policy event_logs_update_anon on public.event_logs
  for update to anon
  using (false);

-- rationale: anon users cannot delete event logs
create policy event_logs_delete_anon on public.event_logs
  for delete to anon
  using (false);

-- event_logs policies: authenticated users read/insert their own logs
-- rationale: users can read only their own logs
create policy event_logs_select_authenticated on public.event_logs
  for select to authenticated
  using (user_id = auth.uid());

-- rationale: users can insert logs only for themselves
create policy event_logs_insert_authenticated on public.event_logs
  for insert to authenticated
  with check (user_id = auth.uid());

-- rationale: users cannot update logs; keep immutable
create policy event_logs_update_authenticated on public.event_logs
  for update to authenticated
  using (false);

-- rationale: deletion is reserved for service role cleanup
create policy event_logs_delete_authenticated on public.event_logs
  for delete to authenticated
  using (auth.role() = 'service_role');

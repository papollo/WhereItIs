-- purpose: create core schema and rls policies for rooms, furniture, items, onboarding, and event logs
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

-- onboarding: single row per user to track progress
create table if not exists public.onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_at timestamptz null,
  last_step text null
);

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

alter table public.rooms enable row level security;
alter table public.room_cells enable row level security;
alter table public.furniture enable row level security;
alter table public.furniture_placements enable row level security;
alter table public.items enable row level security;
alter table public.onboarding enable row level security;
alter table public.event_logs enable row level security;

-- rooms policies
create policy "Rooms read own" on public.rooms
  for select using (user_id = auth.uid());

create policy "Rooms insert own" on public.rooms
  for insert with check (user_id = auth.uid());

create policy "Rooms update own" on public.rooms
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Rooms delete own" on public.rooms
  for delete using (user_id = auth.uid());

-- room_cells policies (room ownership)
create policy "Room cells read own" on public.room_cells
  for select using (
    exists (
      select 1 from public.rooms r
      where r.id = room_cells.room_id
        and r.user_id = auth.uid()
    )
  );

create policy "Room cells insert own" on public.room_cells
  for insert with check (
    exists (
      select 1 from public.rooms r
      where r.id = room_cells.room_id
        and r.user_id = auth.uid()
    )
  );

create policy "Room cells update own" on public.room_cells
  for update using (
    exists (
      select 1 from public.rooms r
      where r.id = room_cells.room_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.rooms r
      where r.id = room_cells.room_id
        and r.user_id = auth.uid()
    )
  );

create policy "Room cells delete own" on public.room_cells
  for delete using (
    exists (
      select 1 from public.rooms r
      where r.id = room_cells.room_id
        and r.user_id = auth.uid()
    )
  );

-- furniture policies
create policy "Furniture read own" on public.furniture
  for select using (user_id = auth.uid());

create policy "Furniture insert own" on public.furniture
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.rooms r
      where r.id = furniture.room_id
        and r.user_id = auth.uid()
    )
  );

create policy "Furniture update own" on public.furniture
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.rooms r
      where r.id = furniture.room_id
        and r.user_id = auth.uid()
    )
  );

create policy "Furniture delete own" on public.furniture
  for delete using (user_id = auth.uid());

-- furniture_placements policies (furniture + room ownership)
create policy "Furniture placements read own" on public.furniture_placements
  for select using (
    exists (
      select 1 from public.furniture f
      where f.id = furniture_placements.furniture_id
        and f.user_id = auth.uid()
    )
    and exists (
      select 1 from public.rooms r
      where r.id = furniture_placements.room_id
        and r.user_id = auth.uid()
    )
  );

create policy "Furniture placements insert own" on public.furniture_placements
  for insert with check (
    exists (
      select 1 from public.furniture f
      where f.id = furniture_placements.furniture_id
        and f.user_id = auth.uid()
    )
    and exists (
      select 1 from public.rooms r
      where r.id = furniture_placements.room_id
        and r.user_id = auth.uid()
    )
  );

create policy "Furniture placements update own" on public.furniture_placements
  for update using (
    exists (
      select 1 from public.furniture f
      where f.id = furniture_placements.furniture_id
        and f.user_id = auth.uid()
    )
    and exists (
      select 1 from public.rooms r
      where r.id = furniture_placements.room_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.furniture f
      where f.id = furniture_placements.furniture_id
        and f.user_id = auth.uid()
    )
    and exists (
      select 1 from public.rooms r
      where r.id = furniture_placements.room_id
        and r.user_id = auth.uid()
    )
  );

create policy "Furniture placements delete own" on public.furniture_placements
  for delete using (
    exists (
      select 1 from public.furniture f
      where f.id = furniture_placements.furniture_id
        and f.user_id = auth.uid()
    )
  );

-- items policies
create policy "Items read own" on public.items
  for select using (
    user_id = auth.uid()
    and exists (
      select 1 from public.furniture f
      where f.id = items.furniture_id
        and f.user_id = auth.uid()
    )
  );

create policy "Items insert own" on public.items
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.furniture f
      where f.id = items.furniture_id
        and f.user_id = auth.uid()
    )
  );

create policy "Items update own" on public.items
  for update using (
    user_id = auth.uid()
    and exists (
      select 1 from public.furniture f
      where f.id = items.furniture_id
        and f.user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.furniture f
      where f.id = items.furniture_id
        and f.user_id = auth.uid()
    )
  );

create policy "Items delete own" on public.items
  for delete using (
    user_id = auth.uid()
    and exists (
      select 1 from public.furniture f
      where f.id = items.furniture_id
        and f.user_id = auth.uid()
    )
  );

-- onboarding policies
create policy "Onboarding read own" on public.onboarding
  for select using (user_id = auth.uid());

create policy "Onboarding upsert own" on public.onboarding
  for insert with check (user_id = auth.uid());

create policy "Onboarding update own" on public.onboarding
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- event_logs policies
create policy "Event logs read own" on public.event_logs
  for select using (user_id = auth.uid());

create policy "Event logs insert own" on public.event_logs
  for insert with check (user_id = auth.uid());

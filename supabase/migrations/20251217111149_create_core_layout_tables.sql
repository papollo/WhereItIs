-- migration: create spatial layout, inventory, onboarding, and event logging tables with strict rls.
-- tables: rooms, furniture, items, onboarding, event_logs.
-- extras: pg_trgm for trigram search, updated_at trigger helper, pg_cron-based ttl purge for event_logs.
-- safety: rls enabled and forced on all tables; service_role policies included for operational tasks.

-- ensure required extensions exist for text search and scheduled maintenance.
create extension if not exists pg_trgm with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- helper trigger to keep updated_at fresh without duplicating logic.
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- rooms owned by users; define spatial grid plus presentation color.
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) > 0 and char_length(name) <= 120),
  x_start numeric(6,2) not null check (x_start >= 0),
  y_start numeric(6,2) not null check (y_start >= 0),
  width_cells integer not null check (width_cells between 1 and 50),
  height_cells integer not null check (height_cells between 1 and 50),
  cell_size_m numeric(3,1) not null default 0.5 check (cell_size_m = 0.5),
  color text not null default '#ffffff' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_by uuid not null references auth.users(id) check (created_by = user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rooms_user_name_lower_uidx on public.rooms (user_id, lower(name));
create index if not exists rooms_user_id_idx on public.rooms (user_id);

create trigger trg_rooms_updated_at
before update on public.rooms
for each row
execute function public.tg_set_updated_at();

-- furniture belongs to a room and user; color and description are user managed.
create table if not exists public.furniture (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) > 0 and char_length(name) <= 150),
  description text null check (description is null or char_length(description) <= 500),
  color text not null default '#ffffff' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_by uuid not null references auth.users(id) check (created_by = user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists furniture_room_name_lower_uidx on public.furniture (room_id, lower(name));
create index if not exists furniture_room_id_idx on public.furniture (room_id);
create index if not exists furniture_user_id_idx on public.furniture (user_id);

create trigger trg_furniture_updated_at
before update on public.furniture
for each row
execute function public.tg_set_updated_at();

-- items sit on furniture; created_by can be user or system (not enforced by fk to allow ai/service inserts).
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  furniture_id uuid not null references public.furniture(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) > 0 and char_length(name) <= 200),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_furniture_id_idx on public.items (furniture_id);
create index if not exists items_user_id_idx on public.items (user_id);
create index if not exists items_name_trgm_idx on public.items using gin (lower(name) gin_trgm_ops);

create trigger trg_items_updated_at
before update on public.items
for each row
execute function public.tg_set_updated_at();

-- onboarding status per user.
create table if not exists public.onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_at timestamptz null,
  last_step text null
);

-- append-only event logs; optional links allow partial context retention.
create table if not exists public.event_logs (
  id bigserial primary key,
  event_time timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid null references public.rooms(id) on delete set null,
  furniture_id uuid null references public.furniture(id) on delete set null,
  item_id uuid null references public.items(id) on delete set null,
  message text not null check (char_length(message) > 0 and char_length(message) <= 500)
);

create index if not exists event_logs_user_id_idx on public.event_logs (user_id);
create index if not exists event_logs_event_time_idx on public.event_logs (event_time);

-- rls enforcement to protect user-scoped data.
alter table public.rooms enable row level security;
alter table public.rooms force row level security;
alter table public.furniture enable row level security;
alter table public.furniture force row level security;
alter table public.items enable row level security;
alter table public.items force row level security;
alter table public.onboarding enable row level security;
alter table public.onboarding force row level security;
alter table public.event_logs enable row level security;
alter table public.event_logs force row level security;

-- rooms policies
create policy rooms_select_authenticated on public.rooms
for select to authenticated
using (auth.uid() = user_id);

create policy rooms_select_anon_deny on public.rooms
for select to anon
using (false);

create policy rooms_select_service_role on public.rooms
for select to service_role
using (true);

create policy rooms_insert_authenticated on public.rooms
for insert to authenticated
with check (auth.uid() = user_id and created_by = auth.uid());

create policy rooms_insert_anon_deny on public.rooms
for insert to anon
with check (false);

create policy rooms_insert_service_role on public.rooms
for insert to service_role
with check (true);

create policy rooms_update_authenticated on public.rooms
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and created_by = user_id);

create policy rooms_update_anon_deny on public.rooms
for update to anon
using (false)
with check (false);

create policy rooms_update_service_role on public.rooms
for update to service_role
using (true)
with check (true);

create policy rooms_delete_authenticated on public.rooms
for delete to authenticated
using (auth.uid() = user_id);

create policy rooms_delete_anon_deny on public.rooms
for delete to anon
using (false);

create policy rooms_delete_service_role on public.rooms
for delete to service_role
using (true);

-- furniture policies
create policy furniture_select_authenticated on public.furniture
for select to authenticated
using (auth.uid() = user_id);

create policy furniture_select_anon_deny on public.furniture
for select to anon
using (false);

create policy furniture_select_service_role on public.furniture
for select to service_role
using (true);

create policy furniture_insert_authenticated on public.furniture
for insert to authenticated
with check (auth.uid() = user_id and created_by = auth.uid());

create policy furniture_insert_anon_deny on public.furniture
for insert to anon
with check (false);

create policy furniture_insert_service_role on public.furniture
for insert to service_role
with check (true);

create policy furniture_update_authenticated on public.furniture
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and created_by = user_id);

create policy furniture_update_anon_deny on public.furniture
for update to anon
using (false)
with check (false);

create policy furniture_update_service_role on public.furniture
for update to service_role
using (true)
with check (true);

create policy furniture_delete_authenticated on public.furniture
for delete to authenticated
using (auth.uid() = user_id);

create policy furniture_delete_anon_deny on public.furniture
for delete to anon
using (false);

create policy furniture_delete_service_role on public.furniture
for delete to service_role
using (true);

-- items policies
create policy items_select_authenticated on public.items
for select to authenticated
using (auth.uid() = user_id);

create policy items_select_anon_deny on public.items
for select to anon
using (false);

create policy items_select_service_role on public.items
for select to service_role
using (true);

create policy items_insert_authenticated on public.items
for insert to authenticated
with check (auth.uid() = user_id and created_by = auth.uid());

create policy items_insert_anon_deny on public.items
for insert to anon
with check (false);

create policy items_insert_service_role on public.items
for insert to service_role
with check (true);

create policy items_update_authenticated on public.items
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy items_update_anon_deny on public.items
for update to anon
using (false)
with check (false);

create policy items_update_service_role on public.items
for update to service_role
using (true)
with check (true);

create policy items_delete_authenticated on public.items
for delete to authenticated
using (auth.uid() = user_id);

create policy items_delete_anon_deny on public.items
for delete to anon
using (false);

create policy items_delete_service_role on public.items
for delete to service_role
using (true);

-- onboarding policies
create policy onboarding_select_authenticated on public.onboarding
for select to authenticated
using (auth.uid() = user_id);

create policy onboarding_select_anon_deny on public.onboarding
for select to anon
using (false);

create policy onboarding_select_service_role on public.onboarding
for select to service_role
using (true);

create policy onboarding_insert_authenticated on public.onboarding
for insert to authenticated
with check (auth.uid() = user_id);

create policy onboarding_insert_anon_deny on public.onboarding
for insert to anon
with check (false);

create policy onboarding_insert_service_role on public.onboarding
for insert to service_role
with check (true);

create policy onboarding_update_authenticated on public.onboarding
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy onboarding_update_anon_deny on public.onboarding
for update to anon
using (false)
with check (false);

create policy onboarding_update_service_role on public.onboarding
for update to service_role
using (true)
with check (true);

create policy onboarding_delete_authenticated on public.onboarding
for delete to authenticated
using (auth.uid() = user_id);

create policy onboarding_delete_anon_deny on public.onboarding
for delete to anon
using (false);

create policy onboarding_delete_service_role on public.onboarding
for delete to service_role
using (true);

-- event_logs policies
create policy event_logs_select_authenticated on public.event_logs
for select to authenticated
using (auth.uid() = user_id);

create policy event_logs_select_anon_deny on public.event_logs
for select to anon
using (false);

create policy event_logs_select_service_role on public.event_logs
for select to service_role
using (true);

create policy event_logs_insert_authenticated on public.event_logs
for insert to authenticated
with check (auth.uid() = user_id);

create policy event_logs_insert_anon_deny on public.event_logs
for insert to anon
with check (false);

create policy event_logs_insert_service_role on public.event_logs
for insert to service_role
with check (true);

create policy event_logs_update_authenticated on public.event_logs
for update to authenticated
using (false)
with check (false);

create policy event_logs_update_anon_deny on public.event_logs
for update to anon
using (false)
with check (false);

create policy event_logs_update_service_role on public.event_logs
for update to service_role
using (true)
with check (true);

create policy event_logs_delete_authenticated on public.event_logs
for delete to authenticated
using (false);

create policy event_logs_delete_anon_deny on public.event_logs
for delete to anon
using (false);

create policy event_logs_delete_service_role on public.event_logs
for delete to service_role
using (true);

-- scheduled cleanup: purge event logs older than 30 days to control growth.
create or replace function public.purge_event_logs_older_than_30_days()
returns void
language plpgsql
as $$
begin
  delete from public.event_logs where event_time < now() - interval '30 days';
end;
$$;

select
  cron.schedule(
    'event_logs_ttl_daily',
    '0 3 * * *',
    $$select public.purge_event_logs_older_than_30_days();$$
  )
where not exists (
  select 1 from cron.job where jobname = 'event_logs_ttl_daily'
);

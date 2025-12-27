-- purpose: enable RLS and add user-scoped policies for core tables
-- affected tables: rooms, room_cells, furniture, furniture_placements, items, onboarding, event_logs

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

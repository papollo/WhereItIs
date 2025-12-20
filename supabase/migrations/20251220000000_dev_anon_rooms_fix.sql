-- DEV ONLY (local testing):
-- Ensure anon can insert/select rooms for DEFAULT_USER_ID and remove auth.users FKs.
-- This migration avoids `CREATE POLICY IF NOT EXISTS` for broader Postgres compatibility.

-- Use the same UUID as `frontend/src/db/supabase.client.ts` DEFAULT_USER_ID.
do $$
begin
  -- Drop FKs to `auth.users` so the default id does not need to exist in Supabase Auth.
  alter table public.rooms drop constraint if exists rooms_user_id_fkey;
  alter table public.rooms drop constraint if exists rooms_created_by_fkey;
end;
$$;

drop policy if exists rooms_select_anon_dev on public.rooms;
create policy rooms_select_anon_dev on public.rooms
for select to anon
using (user_id = '11111111-1111-1111-1111-111111111111'::uuid);

drop policy if exists rooms_insert_anon_dev on public.rooms;
create policy rooms_insert_anon_dev on public.rooms
for insert to anon
with check (
  user_id = '11111111-1111-1111-1111-111111111111'::uuid
  and created_by = '11111111-1111-1111-1111-111111111111'::uuid
);


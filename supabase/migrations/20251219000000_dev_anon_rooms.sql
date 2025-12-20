-- DEV ONLY (local testing):
-- Allow `anon` access to `public.rooms` without Supabase Auth by:
-- - allowing select/insert for a fixed "default user id"
-- - dropping FKs to `auth.users` so the default id does not need to exist in Auth

-- Use the same UUID as `frontend/src/db/supabase.client.ts` DEFAULT_USER_ID.
-- This is intentionally hardcoded for local development convenience.

-- RLS policies for role `anon` (additive; does not remove existing deny policies)
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

-- The schema originally references `auth.users`. Without Auth, inserts would fail on FK checks.
alter table public.rooms drop constraint if exists rooms_user_id_fkey;
alter table public.rooms drop constraint if exists rooms_created_by_fkey;

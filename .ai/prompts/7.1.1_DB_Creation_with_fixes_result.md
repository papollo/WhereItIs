1. Lista tabel z kolumnami, typami i ograniczeniami
- **rooms**
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `name text NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 120)`
  - `color text NOT NULL DEFAULT '#FFFFFF' CHECK (color ~ '^#[0-9A-Fa-f]{6}$')`
  - `created_by uuid NOT NULL REFERENCES auth.users(id) CHECK (created_by = user_id)`
  - `created_at timestamptz NOT NULL DEFAULT now()`
  - `updated_at timestamptz NOT NULL DEFAULT now()`
- **room_cells**
  - `room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE`
  - `x integer NOT NULL CHECK (x BETWEEN 0 AND 49)`
  - `y integer NOT NULL CHECK (y BETWEEN 0 AND 49)`
  - `PRIMARY KEY (room_id, x, y)`
- **furniture**
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE`
  - `user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `name text NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 150)`
  - `description text NULL CHECK (char_length(description) <= 500)`
  - `color text NOT NULL DEFAULT '#FFFFFF' CHECK (color ~ '^#[0-9A-Fa-f]{6}$')`
  - `created_by uuid NOT NULL REFERENCES auth.users(id) CHECK (created_by = user_id)`
  - `created_at timestamptz NOT NULL DEFAULT now()`
  - `updated_at timestamptz NOT NULL DEFAULT now()`
- **furniture_placements**
  - `furniture_id uuid PRIMARY KEY REFERENCES furniture(id) ON DELETE CASCADE`
  - `room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE`
  - `x integer NOT NULL CHECK (x BETWEEN 0 AND 49)`
  - `y integer NOT NULL CHECK (y BETWEEN 0 AND 49)`
  - `width_cells integer NOT NULL CHECK (width_cells BETWEEN 1 AND 50)`
  - `height_cells integer NOT NULL CHECK (height_cells BETWEEN 1 AND 50)`
- **items**
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `furniture_id uuid NOT NULL REFERENCES furniture(id) ON DELETE CASCADE`
  - `user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `name text NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 200)`
  - `created_by uuid NOT NULL` — może być `user_id` lub stały UUID `ai_model` (brak FK, aby dopuścić AI)
  - `created_at timestamptz NOT NULL DEFAULT now()`
  - `updated_at timestamptz NOT NULL DEFAULT now()`
- **onboarding**
  - `user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  - `completed_at timestamptz NULL`
  - `last_step text NULL`
- **event_logs**
  - `id bigserial PRIMARY KEY`
  - `event_time timestamptz NOT NULL DEFAULT now()`
  - `user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `room_id uuid NULL REFERENCES rooms(id) ON DELETE SET NULL`
  - `furniture_id uuid NULL REFERENCES furniture(id) ON DELETE SET NULL`
  - `item_id uuid NULL REFERENCES items(id) ON DELETE SET NULL`
  - `message text NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 500)`

2. Relacje między tabelami
- `auth.users (1) — (N) rooms`
- `rooms (1) — (N) room_cells`
- `rooms (1) — (N) furniture`
- `furniture (1) — (1) furniture_placements`
- `furniture (1) — (N) items`
- `auth.users (1) — (1) onboarding`
- `event_logs` opcjonalnie wskazuje na `rooms`, `furniture`, `items`; zawsze powiązany z `auth.users`.

3. Indeksy
- `rooms`: unikalny indeks na `(user_id, lower(name))`; indeks na `user_id`.
- `room_cells`: indeks na `room_id`.
- `furniture`: unikalny indeks na `(room_id, lower(name))`; indeksy na `room_id`, `user_id`.
- `furniture_placements`: indeksy na `room_id`, `furniture_id`.
- `items`: indeks GIN (trigram) na `lower(name)` dla `ILIKE '%fragment%'`; indeksy na `furniture_id`, `user_id`.
- `event_logs`: indeks na `user_id`; indeks na `event_time` do czyszczenia.

4. Zasady PostgreSQL (RLS)
- Włącz RLS na `rooms`, `room_cells`, `furniture`, `furniture_placements`, `items`, `onboarding`, `event_logs`.
- Polityki (przykład):
  - `rooms`: SELECT/UPDATE/DELETE `USING (user_id = auth.uid())`; INSERT z `WITH CHECK (user_id = auth.uid() AND created_by = auth.uid())`.
  - `room_cells`: SELECT/UPDATE/DELETE `USING (room_id IN (SELECT id FROM rooms WHERE user_id = auth.uid()))`; INSERT z `WITH CHECK (room_id IN (SELECT id FROM rooms WHERE user_id = auth.uid()))`.
  - `furniture`: analogicznie z warunkiem `user_id = auth.uid()` oraz `created_by = auth.uid()` przy INSERT.
  - `furniture_placements`: SELECT/UPDATE/DELETE `USING (room_id IN (SELECT id FROM rooms WHERE user_id = auth.uid()))`; INSERT z `WITH CHECK (room_id IN (SELECT id FROM rooms WHERE user_id = auth.uid()))`.
  - `items`: SELECT/UPDATE/DELETE `USING (user_id = auth.uid())`; INSERT `WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role')` (umożliwia tworzenie wpisów AI/service z `created_by = ai_model_uuid`).
  - `onboarding`: pełny dostęp użytkownika do własnego rekordu `user_id = auth.uid()`.
  - `event_logs`: SELECT/INSERT `USING (user_id = auth.uid())`; dodatkowa polityka dla `service_role` na techniczne wpisy i DELETE (czyszczenie TTL).

5. Zasady spójności (aplikacja lub trigger)
- `room_cells` definiuje nieregularny kształt pokoju i musi być spójny z `width_cells`/`height_cells` (zakres 0..49).
- `furniture_placements` musi mieścić się w obrębie `room_cells` (wszystkie komórki prostokąta muszą istnieć w `room_cells`).
- Meble nie powinny się nakładać: walidacja kolizji w aplikacji lub trigger.

6. Dodatkowe uwagi
- Normalizuj nazwy do lowercase w aplikacji lub triggerem (unikalność wymuszana na `lower(name)`).
- Ustaw trigger na automatyczne `updated_at` dla `rooms`, `furniture`, `items`.
- Dodaj cron/TTL: `DELETE FROM event_logs WHERE event_time < now() - interval '30 days'`.
- Włącz rozszerzenie `pg_trgm` dla indeksu GIN na `items.name`.
- Po ustaleniu stałego UUID `ai_model` dodaj CHECK na `items.created_by IN (user_id, 'ai-model-uuid')`.

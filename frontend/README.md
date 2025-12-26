# WhereItIs

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npm run test:e2e` to execute the end-to-end tests via [Playwright](https://playwright.dev/).
If this is your first run, install browsers with `npx playwright install`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## REST /rooms (create)

The app uses Supabase PostgREST for the `rooms` table and creates rooms via `RoomsApi`.

- Implementation: `frontend/src/app/rooms/rooms.api.ts`
- Types/select: `frontend/src/app/rooms/rooms.types.ts`
- Validation: `frontend/src/app/rooms/rooms.validation.ts`
- Error mapping: `frontend/src/app/rooms/rooms.errors.ts`

Important:
- This implementation does not use Supabase Auth; it injects `user_id` and `created_by` using `DEFAULT_USER_ID` from `frontend/src/db/supabase.client.ts`.
- Local Supabase must allow `anon` to insert/select `public.rooms` for that `DEFAULT_USER_ID` and must not enforce FKs to `auth.users`. Dev-only migrations are provided in `supabase/migrations/20251219000000_dev_anon_rooms.sql` and `supabase/migrations/20251220000000_dev_anon_rooms_fix.sql`.

Example usage:

```ts
const roomsApi = inject(RoomsApi);
await roomsApi.createRoom({
  name: 'Kitchen',
  color: '#aabbcc',
  x_start: 0,
  y_start: 0,
  width_cells: 40,
  height_cells: 40,
  cell_size_m: 0.5,
});
```

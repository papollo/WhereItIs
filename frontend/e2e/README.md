# Playwright E2E

## Wymagania

- Uruchomione zaleznosci: `npm install`
- Dzialajacy Supabase w chmurze
- Ustawione dane Supabase w `frontend/src/environments/environment.e2e.ts`
- Zmienne srodowiskowe z `.env.test` (ladowane automatycznie przez Playwright):
  - `SUPABASE_URL`
  - `SUPABASE_PUBLIC_KEY`
  - `E2E_USERNAME_ID`
  - `E2E_USERNAME`
  - `E2E_PASSWORD`

## Uruchomienie testow

1) Uruchom aplikacje w osobnym terminalu:
```
cd frontend
npm start -- --configuration=e2e
```

2) W drugim terminalu zaladuj zmienne i odpal testy:
```
cd frontend
npm run test:e2e
```

## Wskazowki

- Pierwsze uruchomienie testow ze snapshotami:
```
cd frontend
npx playwright test --update-snapshots
```
- Tryb UI:
```
cd frontend
npm run test:e2e:ui
```
- Tryb headed:
```
cd frontend
npm run test:e2e:headed
```

# WhereItIs

![Status](https://img.shields.io/badge/status-in%20progress-orange) ![Framework](https://img.shields.io/badge/Angular-21-DD0031) ![License](https://img.shields.io/badge/license-TBD-lightgrey)

Simple web/desktop app that helps you remember where things are at home by mapping rooms, furniture, and items, and providing a quick search to jump straight to what you need.

## Table of contents
- [1. Project name](#1-project-name)
- [2. Project description](#2-project-description)
- [3. Tech stack](#3-tech-stack)
- [4. Getting started locally](#4-getting-started-locally)
- [5. Available scripts](#5-available-scripts)
- [6. Project scope](#6-project-scope)
- [7. Project status](#7-project-status)
- [8. License](#8-license)

## 1. Project name
WhereItIs

## 2. Project description
WhereItIs lets users create virtual rooms on a grid, add furniture with colors and descriptions, and attach items to each piece. A search bar surfaces which furniture contains a requested item and can navigate the user to the right room. Accounts are email/password based, with onboarding for first-time users, lightweight analytics for key actions, and clear in-app error messages.

## 3. Tech stack
- Angular 21 with TypeScript, HTML5/CSS3, and RxJS
- Angular Material for UI components
- Supabase for backend services (as specified)
- Unit tests: Karma + Jasmine
- E2E tests: Playwright (planned)
- GitHub Actions for CI/CD
- VPS hosting target

## 4. Getting started locally
1. Install Node.js (no `.nvmrc` provided; align with Angular CLI 21 requirements, e.g., Node 18.19+).
2. Install dependencies:
   ```bash
   cd where_it_is
   npm install
   ```
3. Run the dev server:
   ```bash
   npm start
   ```
   The app serves at `http://localhost:4200/` with live reload.
4. Production build:
   ```bash
   npm run build
   ```

## 5. Available scripts
- `npm start` — start the dev server (`ng serve`).
- `npm run build` — create a production build.
- `npm run watch` — rebuild on file changes using the development config.
- `npm test` — run Karma/Jasmine tests in watch mode.

## 6. Project scope
- Core features: create/edit/delete rooms with colored 0.5m grids (up to 20m × 20m); add/edit/delete furniture per room with color and description; modal-driven item lists allowing multiple additions and deletions; real-time or submit-based search that lists matching furniture and links to the correct room/mebel; email/password auth with hashed passwords and user-scoped data; onboarding flow that can be replayed; key event logging (`room_created`, `furniture_created`, `item_added`, `search_performed`); dismissible error toasts.
- Out of scope for MVP: 3D models; cloud sync or multi-platform accounts; sharing data with other users; tagging/metadata systems; camera-based recognition; data export/import; roles beyond USER; versioning for rooms/furniture.
- Constraints: web/desktop only; PostgreSQL database; no external service integrations beyond the stated stack.

## 7. Project status
In development per PRD; implementation coverage not yet documented in this README.

## 8. License
Not specified.

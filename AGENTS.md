# Repository Guidelines

This repository hosts the Angular 21 project `where_it_is`. Use the notes below to get oriented quickly and keep contributions consistent.

## Project Structure & Module Organization
- App source lives in `where_it_is/src/app` with the root module in `app.module.ts`, routing in `app-routing.module.ts`, and the shell view in `app.component.*`.
- Shared assets (images, fonts, icons) belong in `where_it_is/src/assets`; global styles are in `where_it_is/src/styles.scss`.
- Workspace config is at `where_it_is/angular.json` and TypeScript configs at `tsconfig*.json`. Karma/Jasmine specs sit beside implementations as `*.spec.ts`.
- Node dependencies are installed into `where_it_is/node_modules` (not checked in). Keep new scripts and tooling defined in `where_it_is/package.json`.

## Build, Test, and Development Commands
- Install once per clone: `cd where_it_is && npm install`.
- Run the dev server: `npm start` (alias for `ng serve`) at `http://localhost:4200/`; live reload watches `src/**/*`.
- Production build: `npm run build` outputs to `dist/where-it-is`; use `npm run watch` for continuous rebuilds during local QA.
- Unit tests: `npm test` runs Karma/Jasmine in watch mode; keep the runner open while iterating to catch regressions early.
- Scaffolding: `npx ng generate component feature-name` (or directive/service/pipe) to keep file structure and naming aligned with Angular defaults.

## Coding Style & Naming Conventions
- TypeScript, HTML, and SCSS use 2-space indentation; favor Angular’s style guide (PascalCase classes, camelCase methods/props, dash-cased filenames such as `search-panel.component.ts`).
- Component selectors stay `app-*`. Keep modules cohesive by feature; avoid oversized `AppModule`.
- Run formatters before committing if you add prettier/ESLint; match existing spacing and quote choices.

## Testing Guidelines
- Write or update `*.spec.ts` next to the code under test; use Angular `TestBed` and Jasmine’s `describe/it` naming mirroring the component/service name.
- Aim for fast, deterministic tests; mock HTTP or timers instead of hitting real endpoints. Track regressions by keeping added components and pipes covered.

## Commit & Pull Request Guidelines
- Commit messages in the repo are short and present-tense (e.g., `Add search layout`, `Fix card spacing`). Keep commits focused and include scope when useful.
- Pull requests should briefly state what changed, why, and any follow-up todos; attach screenshots for UI updates and link issues/tasks when available. Note testing performed (e.g., `npm test`, manual smoke on `ng serve`).

## Codex Exclusions
- Do not read or edit `.env.test`.

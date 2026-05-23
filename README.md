# BEDR Monorepo

BEDR is a starter stack for building your own project with Bun workspaces, ElysiaJS, Drizzle ORM, React 19, and a shared Eden Treaty client.

The default repository state is intentionally minimal so you can shape the frontend, backend modules, and branding around your own product.

An optional demo app is included as reference material. You can install it when you want example routes, auth screens, and a small shop flow, but it is not the primary way this repository is meant to be used.

## Structure

- `apps/backend`: Elysia API with feature-based modules and Drizzle SQLite setup.
- `apps/frontend`: React 19 + Vite client.
- `packages/shared-client`: Shared typed Eden Treaty client.

## Recommended Workflow

Use this repository as a foundation for your own app:

1. Start from the default base frontend and backend setup.
2. Replace the starter shell, routes, metadata, and modules with your own domain.
3. Keep only the example pieces that help you move faster.
4. Use the demo only when you want a concrete reference implementation.

## Development

```bash
cp .env.example .env
bun install
bun run db:migrate
bun run dev:backend
bun run dev:frontend
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

## Build Your Own Project

The repository is already set up to be reshaped into your own application.

Start here first:

- replace the shell in `apps/frontend/src/pages/App.tsx`
- replace the starter page in `apps/frontend/src/pages/HomePage.tsx`
- define your own routes in `apps/frontend/src/main.tsx`
- add backend feature modules in `apps/backend/src/modules`
- rename metadata and branding before you ship anything

If you do nothing with the demo at all, that is a normal and supported way to use BEDR.

## Extending The App

### Add a frontend page

Create a page component in `apps/frontend/src/pages` and register it in the router in `apps/frontend/src/main.tsx`.
If the page should use the shared shell, add it as a child route under `<App />`; if it should be protected, place it inside the `<ProtectedRoute />` branch.
Add a matching navigation link in `apps/frontend/src/pages/App.tsx` when the page should be reachable from the main header.

### Add a backend endpoint

Create or extend a feature module under `apps/backend/src/modules`, usually with a `controller.ts`, `service.ts`, and `model.ts`.
Define the route in the module controller with Elysia, for example under a prefix such as `/users` or `/auth`, then register that controller in `apps/backend/src/server.ts` inside the `/api` group.
Keep request/response schemas in the module model file and put business logic in the service so controllers stay thin.

## Turn It Into Your Own Project

The safest path is to replace the app in layers instead of rewriting everything at once.

### 1. Keep The Foundation

These parts are the reusable scaffold:

- Bun workspaces at the repo root
- React 19 + Vite frontend in `apps/frontend`
- Elysia backend in `apps/backend`
- Drizzle setup and migrations
- shared package wiring in `packages/shared-client`
- base TypeScript, ESLint, Prettier, and Docker setup

### 2. Replace Routing And Shell First

Start by replacing the route tree in `apps/frontend/src/main.tsx` and the layout shell in `apps/frontend/src/pages/App.tsx`.

Recommended approach:

- keep one simple root page working first
- start from the default base frontend
- add your own top-level routes before rebuilding feature modules
- remove unused example routes instead of adapting them all at once

### 3. Replace Demo Domain Logic

Then swap the example domain with your own domain modules.

Frontend examples:

- replace the starter page with your landing page, dashboard, CMS blocks, or product UI
- replace demo auth or shop flows with your own forms, lists, and mutations
- remove Zustand or React Query pieces you do not need

Backend examples:

- replace `/api/auth/*` with your own auth or remove it entirely
- replace `/api/users` with your own resources such as `/api/projects`, `/api/posts`, or `/api/orders`
- create new modules under `apps/backend/src/modules/<feature>` and register them in `apps/backend/src/server.ts`

### 4. Rename Content And Metadata Early

To avoid shipping leftover starter or demo copy, update these early in the process:

- `README.md`
- `apps/frontend/index.html`
- `apps/frontend/src/components/SeoHead.tsx`
- visible branding in `apps/frontend/src/pages/App.tsx` and any remaining pages

### 5. Reconfigure Runtime Values

Before deploying or sharing the project, verify:

- `VITE_API_URL` points to your real backend
- `CORS_ORIGIN` allows your actual frontend hosts
- `JWT_SECRET`, `COOKIE_NAME`, and database settings match your environment
- Docker build args and exposed ports match your deployment setup

### Example Migration Path

For a content site:

- replace `HomePage.tsx` with your landing page
- remove auth and shop example routes if they are irrelevant
- keep Elysia and add your own content or form endpoints

For a product app:

- keep auth only if needed
- replace example frontend screens with your own feature screens
- keep the backend module pattern and add one feature folder at a time

## Optional Demo Reference

The repository now starts in a base-only frontend state.

The active app contains:

- a minimal shell in `apps/frontend/src/pages/App.tsx`
- a starter home page in `apps/frontend/src/pages/HomePage.tsx`
- no active dashboard or `/shop` demo routes

The old frontend demo has been moved to `demo/demo/` and can be copied into the active app with scripts.

Available scripts:

- `bun run demo:install`: copies the demo pages and supporting files from `demo/demo/` into `apps/frontend/src` and runs the backend migrations so the required SQLite database is created when missing
- `bun run demo:remove`: restores the base frontend from `demo/base/` and removes the copied demo files again

This lets you keep the repository lean by default while still being able to restore the demo screens instantly.

## Demo Templates

The frontend demo lives outside the active app in `demo/`.

Template layout:

- `demo/base/`: the base-only frontend files
- `demo/demo/`: the full account, dashboard, and shop demo files

The demo installer works by copying those files over the active frontend sources.

### Frontend Demo Files

The installed demo UI is wired from `apps/frontend/src/main.tsx` and adds these frontend-specific files:

- `apps/frontend/src/pages/HomePage.tsx`
- `apps/frontend/src/pages/DashboardPage.tsx`
- `apps/frontend/src/components/ProtectedRoute.tsx`
- `apps/frontend/src/components/DemoLoginPanel.tsx`
- `apps/frontend/src/components/CreateUserForm.tsx`
- `apps/frontend/src/components/UsersPreview.tsx`
- `apps/frontend/src/pages/ShopPage.tsx`
- `apps/frontend/src/pages/ShopProductPage.tsx`
- `apps/frontend/src/pages/ShopCartPage.tsx`
- `apps/frontend/src/pages/ShopLayout.tsx`
- `apps/frontend/src/components/shop/buttonStyles.ts`
- `apps/frontend/src/components/shop/shopStore.ts`
- `apps/frontend/src/components/shop/useOptimisticCart.ts`
- `apps/frontend/src/lib/shop.ts`

If you no longer want those pages in the active app, you do not need to delete them manually. Run:

```bash
bun run demo:remove
```

If you do want the demo back later, run:

```bash
bun run demo:install
```

That install step also runs `bun run db:migrate`, so the backend database file and schema are created if they do not already exist.

After installing or removing the demo, these integration points are the ones that change:

- `apps/frontend/src/main.tsx`: remove the old imports and replace the route tree with your own pages.
- `apps/frontend/src/pages/App.tsx`: remove the `Shop` and `Cart` nav links and replace the workspace header with your own shell.
- `apps/frontend/src/components/SeoHead.tsx`: replace the default title and description with your own site metadata.

### Backend Demo Files

The backend demo currently exposes auth and users endpoints from `apps/backend/src/server.ts`.

If your project does not need the included auth demo, remove or replace:

- `apps/backend/src/modules/auth/*`
- `apps/backend/src/modules/users/*`

Then update these backend integration points:

- `apps/backend/src/server.ts`: unregister `authController` and `usersController`, then register your own modules.
- `apps/backend/src/core/session.ts`: remove it if you are not using cookie-based sessions.
- `apps/backend/src/core/config.ts`: keep the shared config setup, but update env defaults and CORS rules for your own frontend hosts.

If you do want auth, keep the module structure but replace the demo routes and DTOs with your own domain model.

### Shared Cleanup Checklist

After installing or removing demo files, or after replacing them with your own code, run through this checklist:

- remove dead imports from `apps/frontend/src/main.tsx`, `apps/frontend/src/pages/App.tsx`, and `apps/backend/src/server.ts`
- remove unused dependencies if you drop shop state, React Query devtools, or auth/session flows
- replace demo SEO copy such as `BEDR demo application`
- replace BEDR branding in page titles, badges, headers, and metadata
- run `bun run typecheck`
- run `bun run build`

## Production Commands

```bash
bun run build
bun run start:backend
bun run start:frontend
```

Available production-oriented scripts:

- `bun run prod:backend`: build and start the backend.
- `bun run prod:frontend`: build and serve the frontend on port `4173`.
- `bun run prod`: build the entire monorepo.
- `bun run docker:prod`: start the Docker production stack.

## Auth

The backend uses a real session flow with:

- hashed passwords via `Bun.password`
- JWT sessions stored in an `HttpOnly` cookie
- routes for `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`

## Database

```bash
bun run db:generate
bun run db:migrate
```

The backend uses a local SQLite database at `apps/backend/dev.db` by default.

## Tests

```bash
bun run test
bun run test:backend
```

## Docker

```bash
docker compose up --build
```

This starts the backend on port `3000` and the frontend on port `4173`.

## CI

GitHub Actions automatically runs `bun install --frozen-lockfile`, `bun run typecheck`, and `bun run build` via [.github/workflows/ci.yml](.github/workflows/ci.yml).

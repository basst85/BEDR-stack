# BEDR Monorepo

Monorepo demo project for a BEDR stack project using Bun workspaces, ElysiaJS, Drizzle ORM, React 19, and a shared Eden Treaty client.

## Structure

- `apps/backend`: Elysia API with feature-based modules and Drizzle SQLite setup.
- `apps/frontend`: React 19 + Vite client.
- `packages/shared-client`: Shared typed Eden Treaty client.

## Development

```bash
cp .env.example .env
bun install
bun run db:migrate
bun run dev:backend
bun run dev:frontend
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

## Extending The App

### Add a frontend page

Create a page component in `apps/frontend/src/pages` and register it in the router in `apps/frontend/src/main.tsx`.
If the page should use the shared shell, add it as a child route under `<App />`; if it should be protected, place it inside the `<ProtectedRoute />` branch.
Add a matching navigation link in `apps/frontend/src/pages/App.tsx` when the page should be reachable from the main header.

### Add a backend endpoint

Create or extend a feature module under `apps/backend/src/modules`, usually with a `controller.ts`, `service.ts`, and `model.ts`.
Define the route in the module controller with Elysia, for example under a prefix such as `/users` or `/auth`, then register that controller in `apps/backend/src/server.ts` inside the `/api` group.
Keep request/response schemas in the module model file and put business logic in the service so controllers stay thin.

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

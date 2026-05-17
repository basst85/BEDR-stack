FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock bunfig.toml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared-client/package.json packages/shared-client/package.json

RUN bun install --frozen-lockfile

COPY apps/backend ./apps/backend
COPY packages/shared-client ./packages/shared-client

RUN bun --cwd apps/backend build

ENV PORT=3000
ENV DATABASE_URL=/app/data/dev.db

EXPOSE 3000

CMD ["bun", "--cwd", "apps/backend", "run", "src/server.ts"]

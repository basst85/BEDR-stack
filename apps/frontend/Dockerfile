FROM oven/bun:1.3.14 AS build
WORKDIR /app

COPY package.json bun.lock bunfig.toml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared-client/package.json packages/shared-client/package.json

RUN bun install --frozen-lockfile

COPY apps/frontend ./apps/frontend
COPY apps/backend ./apps/backend
COPY packages/shared-client ./packages/shared-client

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN bun --cwd apps/frontend build

FROM oven/bun:1 AS runtime
WORKDIR /app

COPY --from=build /app/apps/frontend/dist ./dist

EXPOSE 4173

CMD ["bunx", "serve", "-s", "dist", "-l", "4173"]

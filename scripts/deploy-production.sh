#!/usr/bin/env bash

set -euo pipefail

export PATH="$HOME/.bun/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

BUN_BIN="${BUN_BIN:-$(command -v bun || true)}"

if [[ -z "$BUN_BIN" ]]; then
  echo "bun is not available on PATH." >&2
  exit 1
fi

DEPLOY_HOST="${DEPLOY_HOST:-root@167.233.47.85}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/crossvillage}"
SITE_URL="${SITE_URL:-https://crossvillagezeddam.com}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-.env}"
CONTROL_PATH="${HOME}/.ssh/cm-crossvillage-%C"

SSH_OPTIONS=(
  -o ControlMaster=auto
  -o ControlPersist=600
  -o ControlPath="$CONTROL_PATH"
)

cleanup_ssh_control_socket() {
  ssh "${SSH_OPTIONS[@]}" -O exit "$DEPLOY_HOST" >/dev/null 2>&1 || true
  rm -f "$CONTROL_PATH"
}

trap cleanup_ssh_control_socket EXIT

if [[ ! -f "$DEPLOY_ENV_FILE" ]]; then
  echo "Missing deploy env file: $DEPLOY_ENV_FILE" >&2
  exit 1
fi

build_frontend() (
  set -a
  . "$DEPLOY_ENV_FILE"
  set +a

  env -i \
    PATH="$PATH" \
    HOME="$HOME" \
    TMPDIR="${TMPDIR:-}" \
    NODE_ENV=production \
    VITE_API_URL="${VITE_API_URL:-}" \
    VITE_APP_BASE_PATH="${VITE_APP_BASE_PATH:-}" \
    VITE_SITE_URL="${VITE_SITE_URL:-}" \
    "$BUN_BIN" --cwd apps/frontend build
)

echo "==> Running backend tests"
"$BUN_BIN" --cwd apps/backend test

echo "==> Building backend"
"$BUN_BIN" --cwd apps/backend build

echo "==> Building frontend with env from $DEPLOY_ENV_FILE"
build_frontend

echo "==> Opening shared SSH connection"
ssh "${SSH_OPTIONS[@]}" -MNf "$DEPLOY_HOST"

echo "==> Syncing frontend dist"
rsync -av --delete -e "ssh -o ControlMaster=auto -o ControlPersist=600 -o ControlPath=$CONTROL_PATH" apps/frontend/dist/ "$DEPLOY_HOST:$DEPLOY_ROOT/apps/frontend/dist/"

echo "==> Syncing backend runtime files"
rsync -av -e "ssh -o ControlMaster=auto -o ControlPersist=600 -o ControlPath=$CONTROL_PATH" apps/backend/dist/ "$DEPLOY_HOST:$DEPLOY_ROOT/apps/backend/dist/"
rsync -av -e "ssh -o ControlMaster=auto -o ControlPersist=600 -o ControlPath=$CONTROL_PATH" apps/backend/src/ "$DEPLOY_HOST:$DEPLOY_ROOT/apps/backend/src/"
rsync -av -e "ssh -o ControlMaster=auto -o ControlPersist=600 -o ControlPath=$CONTROL_PATH" apps/backend/drizzle/ "$DEPLOY_HOST:$DEPLOY_ROOT/apps/backend/drizzle/"
rsync -av -e "ssh -o ControlMaster=auto -o ControlPersist=600 -o ControlPath=$CONTROL_PATH" apps/backend/package.json "$DEPLOY_HOST:$DEPLOY_ROOT/apps/backend/package.json"
rsync -av -e "ssh -o ControlMaster=auto -o ControlPersist=600 -o ControlPath=$CONTROL_PATH" apps/backend/tsconfig.json "$DEPLOY_HOST:$DEPLOY_ROOT/apps/backend/tsconfig.json"

echo "==> Uploading persistent environment file from $DEPLOY_ENV_FILE"
rsync -av -e "ssh -o ControlMaster=auto -o ControlPersist=600 -o ControlPath=$CONTROL_PATH" "$DEPLOY_ENV_FILE" "$DEPLOY_HOST:$DEPLOY_ROOT/.env.deploy.tmp"

echo "==> Applying environment, migrations, and restart"
ssh "${SSH_OPTIONS[@]}" "$DEPLOY_HOST" "
set -euo pipefail
cd '$DEPLOY_ROOT'
if [[ -f .env ]]; then
  backup_suffix=\$(date +%Y%m%d%H%M%S)
  cp .env .env.bak.\$backup_suffix
fi
install -m 600 .env.deploy.tmp .env
rm -f .env.deploy.tmp
cd '$DEPLOY_ROOT/apps/backend'
/usr/local/bin/bun run src/core/migrate.ts
systemctl restart crossvillage-backend.service
systemctl is-active --quiet crossvillage-backend.service
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://127.0.0.1:3000/health >/dev/null; then
    break
  fi
  sleep 1
done
curl -fsS http://127.0.0.1:3000/health >/dev/null
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS '$SITE_URL/health' >/dev/null; then
    break
  fi
  sleep 1
done
curl -fsS '$SITE_URL/health' >/dev/null
"

echo "==> Deployment complete"
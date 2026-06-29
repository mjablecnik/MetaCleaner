# Shell Scripts — Steering Compliance Brief

## Overview

This document lists all changes required to bring shell scripts across all projects into compliance with the steering rules (`infra-command-execution.md`, `project-backend-service.md`, `project-cli-program.md`).

---

## Global Issues (apply to all projects)

### 1. Script Portability Pattern Missing

Almost all scripts lack the required portability pattern. Every script in `scripts/` MUST start with:

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"
```

**Affected:** All scripts except `frontend/metacleaner-web/scripts/deploy-functions.sh` and `terminal/metacleaner-cli/scripts/parallel_clean.sh`.

### 2. Scripts Must Live in `scripts/` Directory

Steering requires all operational scripts to be located in `scripts/`. Currently most scripts (`start-docker.sh`, `fly-setup.sh`, `build.sh`, `install.sh`) live in the project root.

### 3. `fly-setup.sh` Must Be Renamed to `deploy.sh`

Steering defines `scripts/deploy.sh` as the deployment script. The current `fly-setup.sh` files must be replaced by a proper `scripts/deploy.sh` that handles the full deployment flow (not just setup).

### 4. `stop-docker.sh` Missing Everywhere

No project has a `scripts/stop-docker.sh`. Steering requires it for every backend service.

### 5. Default Deploy Env File Must Be `.env-prod`

Deploy scripts currently read `.env` for secrets. Steering requires `.env-prod` as the default, with `--env` flag support and `DPLOY_ENV_FILE` handling.

---

## Per-Project Task List

### Backend (`backend/metacleaner-server/`)

| # | Task | Priority |
|---|------|----------|
| 1 | Create `scripts/build.sh` — builds Docker image | High |
| 2 | Move `start-docker.sh` → `scripts/start-docker.sh`, add portability pattern | High |
| 3 | Create `scripts/stop-docker.sh` — stops and removes container | High |
| 4 | Replace `fly-setup.sh` with `scripts/deploy.sh` — full deploy flow with `--env` flag, `DPLOY_ENV_FILE` support, default `.env-prod` | High |
| 5 | Fix shebang: change `#!/usr/bin/env bash` → `#!/bin/bash` | Low |
| 6 | Standardize app name parsing to match steering pattern: `grep '^app\s*=' fly.toml \| sed 's/^app\s*=\s*"\(.*\)"/\1/'` | Low |
| 7 | Delete old root-level `start-docker.sh` and `fly-setup.sh` after migration | High |

### Frontend Web (`frontend/metacleaner-web/`)

| # | Task | Priority |
|---|------|----------|
| 1 | Create `scripts/build.sh` — builds Docker image | High |
| 2 | Move `start-docker.sh` → `scripts/start-docker.sh`, add portability pattern | High |
| 3 | Create `scripts/stop-docker.sh` | High |
| 4 | Replace `fly-setup.sh` with `scripts/deploy.sh` — full deploy with `--env` flag, `DPLOY_ENV_FILE`, default `.env-prod` | High |
| 5 | Delete old root-level `start-docker.sh` and `fly-setup.sh` | High |
| 6 | `scripts/deploy-functions.sh` — already compliant, no changes needed | — |

### Frontend App (`frontend/metacleaner-app/`)

| # | Task | Priority |
|---|------|----------|
| 1 | Create `scripts/build.sh` — builds Docker image | High |
| 2 | Move `start-docker.sh` → `scripts/start-docker.sh`, add portability pattern | High |
| 3 | Create `scripts/stop-docker.sh` | High |
| 4 | Replace `fly-setup.sh` with `scripts/deploy.sh` — full deploy flow | High |
| 5 | Move `sync-android.sh` → `scripts/sync-android.sh`, add portability pattern | Medium |
| 6 | Delete old root-level scripts after migration | High |

### Frontend Monitoring (`frontend/metacleaner-monitoring/`)

| # | Task | Priority |
|---|------|----------|
| 1 | Create `scripts/build.sh` — builds Docker image | High |
| 2 | Move `start-docker.sh` → `scripts/start-docker.sh`, add portability pattern | High |
| 3 | Create `scripts/stop-docker.sh` | High |
| 4 | Replace `fly-setup.sh` with `scripts/deploy.sh` — full deploy flow | High |
| 5 | Delete old root-level scripts after migration | High |

### CLI (`terminal/metacleaner-cli/`)

| # | Task | Priority |
|---|------|----------|
| 1 | Move `build.sh` → `scripts/build.sh`, update portability to use PROJECT_DIR | High |
| 2 | Move `install.sh` → `scripts/install.sh`, update portability pattern | High |
| 3 | `install.sh` must call `scripts/build.sh` before copying binary | Medium |
| 4 | Delete old root-level `build.sh` and `install.sh` | High |
| 5 | `scripts/parallel_clean.sh` — already compliant, no changes needed | — |

### Architecture (`architecture/`)

| # | Task | Priority |
|---|------|----------|
| 1 | `start-structurizr.sh` — add full portability pattern (SCRIPT_DIR/PROJECT_DIR/cd) | Low |

This is a utility script, not a backend service or CLI program, so `scripts/` relocation is not required.

---

## Template: `scripts/deploy.sh`

Every backend service / frontend deploy script must follow this structure:

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Resolve env file
if [ -n "${DPLOY_ENV_FILE:-}" ]; then
  ENV_FILE="$DPLOY_ENV_FILE"
elif [ "${1:-}" = "--env" ]; then
  ENV_FILE="$PROJECT_DIR/.env-${2}"
  shift 2
else
  ENV_FILE="$PROJECT_DIR/.env-prod"
fi

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r')

# Check/create app
if fly apps list | grep -q "^$APP_NAME\s"; then
  echo "App $APP_NAME already exists, skipping creation."
else
  echo "Creating app $APP_NAME..."
  fly apps create "$APP_NAME"
fi

# Set secrets from env file (skip fly.toml [env] keys)
FLY_ENV_KEYS=$(sed -n '/^\[env\]/,/^\[/p' fly.toml | grep -E '^\s*\w+\s*=' | sed 's/\s*=.*//' | tr -d ' ')

if [ -f "$ENV_FILE" ]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# || -z "$value" ]] && continue
    echo "$FLY_ENV_KEYS" | grep -q "^${key}$" && continue
    fly secrets set "$key=$value" --app "$APP_NAME"
  done < "$ENV_FILE"
fi

# Deploy
fly deploy
```

## Template: `scripts/stop-docker.sh`

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r')

docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

echo "Stopped and removed container: $APP_NAME"
```

---

## Summary

| Project | Scripts to create | Scripts to move | Scripts to delete |
|---------|:-:|:-:|:-:|
| backend/metacleaner-server | 3 (build, stop-docker, deploy) | 1 (start-docker) | 2 (old root scripts) |
| frontend/metacleaner-web | 3 (build, stop-docker, deploy) | 1 (start-docker) | 2 (old root scripts) |
| frontend/metacleaner-app | 3 (build, stop-docker, deploy) | 2 (start-docker, sync-android) | 3 (old root scripts) |
| frontend/metacleaner-monitoring | 3 (build, stop-docker, deploy) | 1 (start-docker) | 2 (old root scripts) |
| terminal/metacleaner-cli | 0 | 2 (build, install) | 2 (old root scripts) |
| architecture | 0 | 0 | 0 |

**Total: 12 scripts to create, 7 to move, 11 to delete.**

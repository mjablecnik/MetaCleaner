# Shell Scripts — Steering Compliance Specification

## Goal

Bring all shell scripts across the MetaCleaner monorepo into compliance with steering rules. This means:

1. All operational scripts live in `scripts/` within their project
2. Every script starts with the portability pattern (`#!/bin/bash`, `set -euo pipefail`, `SCRIPT_DIR`, `PROJECT_DIR`, `cd "$PROJECT_DIR"`)
3. `fly-setup.sh` is replaced by `scripts/deploy.sh` with `--env` flag, `DPLOY_ENV_FILE` support, and `.env-prod` default
4. Each deployable project gets `scripts/build.sh`, `scripts/stop-docker.sh`
5. `start-docker.sh` moves to `scripts/start-docker.sh` with portability pattern
6. Old root-level scripts are deleted
7. App name parsing uses the standardized `grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r'`

## Projects Affected

| Project | Path | Has fly.toml |
|---------|------|:---:|
| Backend Server | `backend/metacleaner-server/` | Yes |
| Frontend Web | `frontend/metacleaner-web/` | Yes |
| Frontend App | `frontend/metacleaner-app/` | Yes |
| Frontend Monitoring | `frontend/metacleaner-monitoring/` | Yes |
| CLI | `terminal/metacleaner-cli/` | No |
| Architecture | `architecture/` | No |

## Script Templates

### Portability Header (all scripts)

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"
```

### `scripts/build.sh` (all deployable projects)

Builds the Docker image. For projects with workspace dependencies (metacleaner-web, metacleaner-app), uses the frontend root as build context with `-f` pointing to the project Dockerfile. For standalone projects (backend, monitoring), uses `PROJECT_DIR` as context.

### `scripts/start-docker.sh` (all deployable projects)

Calls `scripts/build.sh`, stops/removes existing container, runs new container with `--env-file .env` (or build args for frontend SPAs). Derived from existing root-level `start-docker.sh` logic.

### `scripts/stop-docker.sh` (all deployable projects)

Parses app name from `fly.toml`, stops and removes the container.

### `scripts/deploy.sh` (all deployable projects)

Full deployment flow:
1. Resolve env file: `DPLOY_ENV_FILE` → `--env <name>` → `.env-prod` default
2. Parse app name from `fly.toml`
3. Create Fly.io app if not exists
4. Set secrets from env file (skip keys in `fly.toml [env]`)
5. Run `fly deploy`

### CLI Scripts

- `scripts/build.sh` — moved from root `build.sh`, add portability pattern using `PROJECT_DIR`
- `scripts/install.sh` — moved from root `install.sh`, calls `scripts/build.sh` first, add portability pattern

### Architecture

- `start-structurizr.sh` — stays at root (not a backend service), just add `SCRIPT_DIR`/`PROJECT_DIR` portability pattern

## Key Constraints

- Backend `start-docker.sh` uses `--env-file .env` (runtime env vars)
- Frontend web/app `start-docker.sh` use build args (`--build-arg PUBLIC_API_URL=...`) because the SPA bakes env at build time
- Frontend web/app need workspace root as Docker build context (for `metacleaner-shared`)
- Monitoring uses `--env-file .env` (Vite dev server reads env at runtime inside container)
- The `shebang` must be `#!/bin/bash` (not `#!/usr/bin/env bash`)
- App name parsing: `grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r'`
- `DPLOY_ENV_FILE` (note the typo in the brief — preserve it as-is since that's the steering spec)
- CLI has no `fly.toml` — uses project name from `package.json` for build output naming
- `scripts/parallel_clean.sh` and `scripts/deploy-functions.sh` are already compliant — don't touch them

## File Changes Summary

| Project | Create | Move/Rewrite | Delete |
|---------|--------|--------------|--------|
| backend/metacleaner-server | build.sh, stop-docker.sh, deploy.sh | start-docker.sh → scripts/ | root start-docker.sh, fly-setup.sh |
| frontend/metacleaner-web | build.sh, stop-docker.sh, deploy.sh | start-docker.sh → scripts/ | root start-docker.sh, fly-setup.sh |
| frontend/metacleaner-app | build.sh, stop-docker.sh, deploy.sh | start-docker.sh → scripts/, sync-android.sh → scripts/ | root start-docker.sh, fly-setup.sh, sync-android.sh |
| frontend/metacleaner-monitoring | build.sh, stop-docker.sh, deploy.sh | start-docker.sh → scripts/ | root start-docker.sh, fly-setup.sh |
| terminal/metacleaner-cli | — | build.sh → scripts/, install.sh → scripts/ | root build.sh, install.sh |
| architecture | — | start-structurizr.sh (update in place) | — |

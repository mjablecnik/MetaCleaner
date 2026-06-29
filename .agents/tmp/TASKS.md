# Tasks — Shell Scripts Steering Compliance

## Backend (`backend/metacleaner-server/`)

- [x] 1. [HIGH] Create `scripts/build.sh` — portability header, parses app name from fly.toml, runs `docker build -t "$APP_NAME" .`
- [x] 2. [HIGH] Create `scripts/start-docker.sh` — portability header, calls `./scripts/build.sh`, stops/removes existing container, runs with `--env-file .env` on port 8080
- [x] 3. [HIGH] Create `scripts/stop-docker.sh` — portability header, parses app name, stops and removes container
- [x] 4. [HIGH] Create `scripts/deploy.sh` — portability header, resolves env file (DPLOY_ENV_FILE / --env flag / .env-prod default), creates app if needed, sets secrets skipping fly.toml [env] keys, runs `fly deploy`
- [x] 5. [HIGH] Delete root-level `start-docker.sh` and `fly-setup.sh`

## Frontend Web (`frontend/metacleaner-web/`)

- [x] 6. [HIGH] Create `scripts/build.sh` — portability header, loads build args from .env (PUBLIC_APP_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY), builds with workspace root as context and `-f Dockerfile`
- [x] 7. [HIGH] Create `scripts/start-docker.sh` — portability header, calls `./scripts/build.sh`, stops/removes container, runs on port 3001
- [x] 8. [HIGH] Create `scripts/stop-docker.sh` — portability header, parses app name, stops and removes container
- [x] 9. [HIGH] Create `scripts/deploy.sh` — portability header, resolves env file, creates app if needed, sets secrets, runs `fly deploy`
- [x] 10. [HIGH] Delete root-level `start-docker.sh` and `fly-setup.sh`

## Frontend App (`frontend/metacleaner-app/`)

- [x] 11. [HIGH] Create `scripts/build.sh` — portability header, loads PUBLIC_API_URL from .env, builds with workspace root as context and `-f Dockerfile`
- [x] 12. [HIGH] Create `scripts/start-docker.sh` — portability header, calls `./scripts/build.sh`, stops/removes container, runs on port 3000
- [x] 13. [HIGH] Create `scripts/stop-docker.sh` — portability header, parses app name, stops and removes container
- [x] 14. [HIGH] Create `scripts/deploy.sh` — portability header, resolves env file, creates app if needed, sets secrets, runs `fly deploy`
- [x] 15. [MEDIUM] Create `scripts/sync-android.sh` — portability header, builds SvelteKit app, runs `cap sync android` (moved from root sync-android.sh)
- [x] 16. [HIGH] Delete root-level `start-docker.sh`, `fly-setup.sh`, and `sync-android.sh`

## Frontend Monitoring (`frontend/metacleaner-monitoring/`)

- [x] 17. [HIGH] Create `scripts/build.sh` — portability header, parses app name, runs `docker build -t "$APP_NAME" .`
- [x] 18. [HIGH] Create `scripts/start-docker.sh` — portability header, calls `./scripts/build.sh`, stops/removes container, runs with `--env-file .env` on port 3002
- [x] 19. [HIGH] Create `scripts/stop-docker.sh` — portability header, parses app name, stops and removes container
- [x] 20. [HIGH] Create `scripts/deploy.sh` — portability header, resolves env file, creates app if needed, sets secrets (staged with `--stage` + `secrets deploy`), runs `fly deploy`
- [x] 21. [HIGH] Delete root-level `start-docker.sh` and `fly-setup.sh`

## CLI (`terminal/metacleaner-cli/`)

- [x] 22. [HIGH] Create `scripts/build.sh` — portability header (SCRIPT_DIR/PROJECT_DIR/cd), moves existing build logic (bun build --compile) into it
- [x] 23. [HIGH] Create `scripts/install.sh` — portability header, calls `./scripts/build.sh` first, then copies binary + completions (moved from root install.sh)
- [x] 24. [HIGH] Delete root-level `build.sh` and `install.sh`

## Architecture (`architecture/`)

- [x] 25. [LOW] Update `start-structurizr.sh` in place — add full portability pattern (SCRIPT_DIR as PROJECT_DIR since script is at project root, keeping existing logic intact)

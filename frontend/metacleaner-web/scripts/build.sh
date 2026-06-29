#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*["\x27]\(.*\)["\x27]/\1/' | tr -d '\r')

# Load build args from .env (SPA bakes env at build time)
if [ -f .env ]; then
  export $(grep '^PUBLIC_APP_URL=' .env | xargs) 2>/dev/null || true
  export $(grep '^VITE_SUPABASE_URL=' .env | xargs) 2>/dev/null || true
  export $(grep '^VITE_SUPABASE_ANON_KEY=' .env | xargs) 2>/dev/null || true
fi
PUBLIC_APP_URL="${PUBLIC_APP_URL:-https://app.metacleaner.com}"

echo "Building Docker image: $APP_NAME (PUBLIC_APP_URL=$PUBLIC_APP_URL)"
WORKSPACE_ROOT="$(dirname "$(dirname "$PROJECT_DIR")")"
docker build -t "$APP_NAME" \
  --build-arg "PUBLIC_APP_URL=$PUBLIC_APP_URL" \
  --build-arg "VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-}" \
  --build-arg "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-}" \
  -f "$PROJECT_DIR/Dockerfile" "$WORKSPACE_ROOT"

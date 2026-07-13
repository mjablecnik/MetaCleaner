#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*["\x27]\(.*\)["\x27]/\1/' | tr -d '\r')

# Load build args from .env (SPA bakes env at build time)
if [ -f .env ]; then
  export $(grep '^PUBLIC_API_URL=' .env | xargs) 2>/dev/null || true
fi
PUBLIC_API_URL="${PUBLIC_API_URL:-http://localhost:8080}"

DOCKER_ARGS=""
for arg in "$@"; do
  case "$arg" in
    --no-cache) DOCKER_ARGS="$DOCKER_ARGS --no-cache" ;;
  esac
done

echo "Building Docker image: $APP_NAME (PUBLIC_API_URL=$PUBLIC_API_URL)"
WORKSPACE_ROOT="$(dirname "$(dirname "$PROJECT_DIR")")"
docker build $DOCKER_ARGS -t "$APP_NAME" \
  --build-arg "PUBLIC_API_URL=$PUBLIC_API_URL" \
  -f "$PROJECT_DIR/Dockerfile" "$WORKSPACE_ROOT"

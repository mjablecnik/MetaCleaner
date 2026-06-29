#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*["\x27]\(.*\)["\x27]/\1/' | tr -d '\r')

BUILD_ARGS=""
for arg in "$@"; do
  case "$arg" in
    --no-cache) BUILD_ARGS="$BUILD_ARGS --no-cache" ;;
  esac
done

./scripts/build.sh $BUILD_ARGS

echo "Stopping existing container (if any)..."
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

echo "Starting container: $APP_NAME on port 8080"
docker run -d \
  --name "$APP_NAME" \
  --env-file .env \
  -p 8080:8080 \
  "$APP_NAME"

echo "Running at http://localhost:8080"

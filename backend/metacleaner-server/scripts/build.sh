#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*["\x27]\(.*\)["\x27]/\1/' | tr -d '\r')

DOCKER_ARGS=""
for arg in "$@"; do
  case "$arg" in
    --no-cache) DOCKER_ARGS="$DOCKER_ARGS --no-cache" ;;
  esac
done

echo "Building Docker image: $APP_NAME"
docker build $DOCKER_ARGS -t "$APP_NAME" .

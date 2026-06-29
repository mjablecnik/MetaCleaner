#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r')

echo "Building Docker image: $APP_NAME"
docker build -t "$APP_NAME" .

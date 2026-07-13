#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*["\x27]\(.*\)["\x27]/\1/' | tr -d '\r')

echo "Building Docker image: $APP_NAME"
docker build --no-cache -t "$APP_NAME" .

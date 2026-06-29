#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Resolve env file: DPLOY_ENV_FILE > --env flag > .env-prod default
ENV_FILE=".env-prod"
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENV_FILE=".env-$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
if [[ -n "${DPLOY_ENV_FILE:-}" ]]; then
  ENV_FILE="$DPLOY_ENV_FILE"
fi

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*["\x27]\(.*\)["\x27]/\1/' | tr -d '\r')

echo "Deploying $APP_NAME using env file: $ENV_FILE"

# Create Fly.io app if not exists
if fly apps list | grep -q "^$APP_NAME\s"; then
  echo "App $APP_NAME already exists, skipping creation."
else
  echo "Creating app $APP_NAME..."
  fly apps create "$APP_NAME"
fi

# Extract keys already in fly.toml [env] section (non-secret config)
FLY_ENV_KEYS=$(sed -n '/^\[env\]/,/^\[/p' fly.toml | grep '=' | sed 's/\s*=.*//' | tr -d '\r')

# Set secrets from env file (skip keys already in fly.toml [env])
if [ -f "$ENV_FILE" ]; then
  echo ""
  echo "Setting secrets from $ENV_FILE..."
  while IFS= read -r line; do
    [[ -z "$line" || "$line" == \#* ]] && continue
    KEY="${line%%=*}"
    VALUE="${line#*=}"
    [[ -z "$VALUE" ]] && continue
    if echo "$FLY_ENV_KEYS" | grep -qx "$KEY"; then
      echo "  Skipping $KEY (already in fly.toml [env])"
      continue
    fi
    echo "  Setting $KEY"
    fly secrets set "$KEY=$VALUE" --app "$APP_NAME" --stage
  done < "$ENV_FILE"
  fly secrets deploy --app "$APP_NAME"
fi

echo ""
echo "Running fly deploy..."
fly deploy

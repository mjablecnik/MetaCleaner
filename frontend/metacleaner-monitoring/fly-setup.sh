#!/bin/bash
set -euo pipefail

APP_NAME=$(grep '^app\s*=' fly.toml | sed 's/^app\s*=\s*"\(.*\)"/\1/' | tr -d '\r')

echo "Setting up Fly.io app: $APP_NAME"

# Check if app already exists
if fly apps list | grep -q "^$APP_NAME\s"; then
  echo "App $APP_NAME already exists, skipping creation."
else
  echo "Creating app $APP_NAME..."
  fly apps create "$APP_NAME"
fi

# Extract keys already in fly.toml [env] section (non-secret config)
FLY_ENV_KEYS=$(sed -n '/^\[env\]/,/^\[/p' fly.toml | grep '=' | sed 's/\s*=.*//' | tr -d '\r')

# Set secrets from .env (skip keys already in fly.toml [env])
if [ -f .env ]; then
  echo ""
  echo "Setting secrets from .env..."
  while IFS= read -r line; do
    # Skip comments and empty lines
    [[ -z "$line" || "$line" == \#* ]] && continue
    KEY="${line%%=*}"
    VALUE="${line#*=}"
    # Skip empty values
    [[ -z "$VALUE" ]] && continue
    # Skip keys already in fly.toml [env]
    if echo "$FLY_ENV_KEYS" | grep -qx "$KEY"; then
      echo "  Skipping $KEY (already in fly.toml [env])"
      continue
    fi
    echo "  Setting $KEY"
    fly secrets set "$KEY=$VALUE" --app "$APP_NAME" --stage
  done < .env
  fly secrets deploy --app "$APP_NAME"
fi

echo ""
echo "Setup complete. Deploy with: fly deploy"

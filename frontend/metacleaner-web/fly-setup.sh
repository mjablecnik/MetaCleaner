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

# Read keys already in fly.toml [env] section
FLY_ENV_KEYS=$(sed -n '/^\[env\]/,/^\[/p' fly.toml | grep -E '^\s*\w+\s*=' | sed 's/\s*=.*//' | tr -d ' ')

# Set secrets from .env (skip empty lines, comments, empty values, and keys in fly.toml [env])
if [ -f .env ]; then
  while IFS='=' read -r key value; do
    # Skip comments, empty lines, empty values
    [[ -z "$key" || "$key" =~ ^# || -z "$value" ]] && continue
    # Skip keys already defined in fly.toml [env]
    echo "$FLY_ENV_KEYS" | grep -q "^${key}$" && continue
    echo "Setting secret: $key"
    fly secrets set "$key=$value" --app "$APP_NAME"
  done < .env
else
  echo "No .env file found, skipping secrets."
fi

echo "Setup complete. Deploy with: fly deploy"

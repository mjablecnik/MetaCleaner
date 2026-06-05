#!/usr/bin/env bash
set -euo pipefail

APP_NAME=$(grep '^app' fly.toml | head -1 | sed "s/app *= *['\"]\\(.*\\)['\"]$/\\1/")
if [[ -z "$APP_NAME" ]]; then
    echo "Error: could not parse app name from fly.toml" >&2
    exit 1
fi

echo "App name: $APP_NAME"

# Create app if it doesn't already exist.
if fly apps list | grep -qE "^${APP_NAME}[[:space:]]"; then
    echo "App '$APP_NAME' already exists — skipping create"
else
    echo "Creating app '$APP_NAME'"
    fly apps create "$APP_NAME"
fi

# Collect keys already declared in fly.toml [env] section.
FLY_ENV_KEYS=$(awk '/^\[env\]/,/^\[/' fly.toml | grep -Eo '^[[:space:]]*[A-Z_]+' | tr -d ' ' || true)

# Read .env and set secrets for keys not in fly.toml [env].
if [[ ! -f .env ]]; then
    echo "No .env file found — skipping secret setup"
    exit 0
fi

SECRETS=()
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip comments and empty lines.
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue

    KEY="${line%%=*}"
    VALUE="${line#*=}"

    # Skip if key or value is empty.
    [[ -z "$KEY" || -z "$VALUE" ]] && continue

    # Skip keys already defined in fly.toml [env].
    if echo "$FLY_ENV_KEYS" | grep -qx "$KEY"; then
        echo "Skipping '$KEY' (already in fly.toml [env])"
        continue
    fi

    SECRETS+=("${KEY}=${VALUE}")
done < .env

if [[ ${#SECRETS[@]} -eq 0 ]]; then
    echo "No secrets to set"
else
    echo "Setting ${#SECRETS[@]} secret(s) on '$APP_NAME'"
    fly secrets set "${SECRETS[@]}" --app "$APP_NAME"
fi

echo "Setup complete. Run 'fly deploy' to deploy the app."

#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

LOG_FILE="$PROJECT_DIR/.stripe-webhook.log"
PID_FILE="$PROJECT_DIR/.stripe-webhook.pid"

# Check if already running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "Stripe webhook listener is already running (PID: $PID)."
    echo "Logs: $LOG_FILE"
    echo ""
    echo "To stop: kill $PID && rm $PID_FILE"
    exit 0
  else
    # Stale PID file — process is dead
    rm -f "$PID_FILE"
  fi
fi

# Check if stripe CLI is available
if ! command -v stripe &> /dev/null; then
  echo "Error: stripe CLI not found." >&2
  echo "Install: https://docs.stripe.com/stripe-cli" >&2
  exit 2
fi

echo "Starting Stripe webhook listener in background..."
nohup stripe listen --forward-to http://localhost:8080/api/billing/webhook > "$LOG_FILE" 2>&1 &
STRIPE_PID=$!

echo "$STRIPE_PID" > "$PID_FILE"

# Wait briefly to check it started successfully
sleep 2
if kill -0 "$STRIPE_PID" 2>/dev/null; then
  echo "Stripe webhook listener started (PID: $STRIPE_PID)."
  echo "Forwarding to: http://localhost:8080/api/billing/webhook"
  echo "Logs: $LOG_FILE"
  echo ""
  echo "To stop: kill $STRIPE_PID && rm $PID_FILE"
else
  echo "Error: Stripe webhook listener failed to start." >&2
  echo "Check logs: $LOG_FILE" >&2
  rm -f "$PID_FILE"
  exit 1
fi

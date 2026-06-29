#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Detect available package manager
if command -v bun &> /dev/null; then
  RUN_CMD="bun"
  EXEC_CMD="bunx"
else
  RUN_CMD="npm"
  EXEC_CMD="npx"
fi

echo "=== MetaCleaner Android Sync ==="

# Step 1: Build the SvelteKit app
echo ""
echo "1. Building SvelteKit app..."
$RUN_CMD run build

# Step 2: Sync web assets to Android project
echo ""
echo "2. Syncing with Android..."
$EXEC_CMD cap sync android

echo ""
echo "=== Sync complete! ==="
echo ""
echo "To open in Android Studio:  $EXEC_CMD cap open android"
echo "To run on device/emulator:  $EXEC_CMD cap run android"

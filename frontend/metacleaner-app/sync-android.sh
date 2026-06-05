#!/bin/bash
set -euo pipefail

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
bun run build

# Step 2: Sync web assets to Android project
echo ""
echo "2. Syncing with Android..."
bunx cap sync android

echo ""
echo "=== Sync complete! ==="
echo ""
echo "To open in Android Studio:  bunx cap open android"
echo "To run on device/emulator:  bunx cap run android"

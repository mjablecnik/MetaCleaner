#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BIN_DIR="$SCRIPT_DIR/bin"
ENTRY="$SCRIPT_DIR/src/index.ts"
OUTPUT="$BIN_DIR/metacleaner"

echo "Building MetaCleaner CLI..."

# Create bin directory
mkdir -p "$BIN_DIR"

# Build standalone binary
bun build "$ENTRY" --compile --outfile "$OUTPUT"

echo ""
echo "Build complete: $OUTPUT"
echo "Usage: ./bin/metacleaner scan photo.jpg"

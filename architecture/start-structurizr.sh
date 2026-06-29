#!/bin/bash
set -euo pipefail

# ============================================================================
# Structurizr Local — Architecture Diagrams Viewer
# ============================================================================
# Builds and runs a single Docker container with Structurizr + nginx.
# nginx proxies external requests through localhost, bypassing Structurizr's
# localhost-only restriction. Accessible from any device on the network.
#
# Changes to workspace.dsl are detected automatically — no restart needed.
#
# Usage:
#   ./start-structurizr.sh
#
# Access from this machine:    http://localhost:8081
# Access from other devices:   http://<your-ip>:8081
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
cd "$PROJECT_DIR"

CONTAINER_NAME="structurizr"
IMAGE_NAME="structurizr-local"
PORT=8081
WORKSPACE_DIR="$PROJECT_DIR"

echo "🏗️  Structurizr — Architecture Diagrams"
echo "   Workspace: $WORKSPACE_DIR/workspace.dsl"
echo ""

# Cleanup existing container
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⏹️  Removing existing container..."
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

# Build the image
echo "🔨 Building image..."
docker build -t "$IMAGE_NAME" "$WORKSPACE_DIR"

# Ensure workspace directory is writable
chmod -R a+w "$WORKSPACE_DIR" 2>/dev/null || true

echo ""
echo "🚀 Starting container on port ${PORT}..."

docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "${PORT}:8081" \
    -v "${WORKSPACE_DIR}:/usr/local/structurizr" \
    "$IMAGE_NAME"

# Wait for startup
sleep 8

# Check status
if docker ps --filter "name=${CONTAINER_NAME}" --format '{{.Status}}' | grep -q "Up"; then
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "<your-ip>")
    echo ""
    echo "✅ Running!"
    echo ""
    echo "   Local:   http://localhost:${PORT}"
    echo "   Network: http://${LOCAL_IP}:${PORT}"
    echo ""
    echo "   Stop with:  docker stop ${CONTAINER_NAME}"
    echo "   Logs with:  docker logs -f ${CONTAINER_NAME}"
else
    echo ""
    echo "❌ Failed to start. Logs:"
    echo ""
    docker logs "$CONTAINER_NAME" --tail 30
fi

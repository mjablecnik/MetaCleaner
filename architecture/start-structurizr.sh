#!/bin/bash
set -euo pipefail

# ============================================================================
# Structurizr Local — Architecture Diagrams Viewer
# ============================================================================
# Starts Structurizr (local mode) behind an nginx reverse proxy so it can be
# accessed from any device on the network (not just localhost).
# Changes to workspace.dsl are detected automatically — no restart needed.
#
# Usage:
#   ./start-structurizr.sh
#
# Access from this machine:    http://localhost:8081
# Access from other devices:   http://<your-ip>:8081
# ============================================================================

NETWORK_NAME="structurizr-net"
STRUCTURIZR_CONTAINER="structurizr"
PROXY_CONTAINER="structurizr-proxy"
IMAGE="structurizr/structurizr:latest"
PROXY_IMAGE="nginx:alpine"
PORT=8081
WORKSPACE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🏗️  Structurizr — Architecture Diagrams"
echo "   Workspace: $WORKSPACE_DIR/workspace.dsl"
echo ""

# Cleanup existing containers
for name in "$STRUCTURIZR_CONTAINER" "$PROXY_CONTAINER"; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${name}$"; then
        echo "⏹️  Removing existing container: $name"
        docker stop "$name" >/dev/null 2>&1 || true
        docker rm "$name" >/dev/null 2>&1 || true
    fi
done

# Create network if not exists
if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
    docker network create "$NETWORK_NAME" >/dev/null
fi

# Ensure workspace directory is writable
chmod -R a+w "$WORKSPACE_DIR" 2>/dev/null || true

echo "🚀 Starting Structurizr + nginx proxy on port ${PORT}"
echo "   (changes to workspace.dsl are picked up automatically)"
echo ""

# Start Structurizr (internal only, no port exposed to host)
# structurizr.url tells Structurizr to accept requests on any URL (bypasses localhost check)
docker run -d \
    --name "$STRUCTURIZR_CONTAINER" \
    --network "$NETWORK_NAME" \
    --restart unless-stopped \
    -e STRUCTURIZR_URL=http://localhost:8080 \
    -v "${WORKSPACE_DIR}:/usr/local/structurizr" \
    "$IMAGE" local

# Start nginx proxy (exposed on all interfaces)
docker run -d \
    --name "$PROXY_CONTAINER" \
    --network "$NETWORK_NAME" \
    --restart unless-stopped \
    -p "0.0.0.0:${PORT}:8081" \
    -v "${WORKSPACE_DIR}/nginx-proxy.conf:/etc/nginx/conf.d/default.conf:ro" \
    "$PROXY_IMAGE"

# Wait for startup
sleep 4

# Check status
if docker ps --filter "name=${STRUCTURIZR_CONTAINER}" --format '{{.Status}}' | grep -q "Up"; then
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "<your-ip>")
    echo ""
    echo "✅ Running!"
    echo ""
    echo "   Local:   http://localhost:${PORT}"
    echo "   Network: http://${LOCAL_IP}:${PORT}"
    echo ""
    echo "   Stop with:  docker stop ${STRUCTURIZR_CONTAINER} ${PROXY_CONTAINER}"
    echo "   Logs with:  docker logs -f ${STRUCTURIZR_CONTAINER}"
else
    echo ""
    echo "❌ Structurizr failed to start. Logs:"
    echo ""
    docker logs "$STRUCTURIZR_CONTAINER" --tail 20
fi

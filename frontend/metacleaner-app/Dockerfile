# Build stage — must be built from the workspace root:
#   docker build -f frontend/metacleaner-app/Dockerfile -t <name> .
# Pinned to the exact bun version that generated the committed bun.lock.
# Keep this tag in sync with bun.lock when bumping bun (frozen install fails otherwise).
FROM oven/bun:1.3.14 AS build
WORKDIR /app

ARG PUBLIC_API_URL=http://localhost:8080
ENV PUBLIC_API_URL=$PUBLIC_API_URL

# Copy workspace manifest files so bun can resolve the full workspace graph
COPY package.json bun.lock ./
COPY frontend/metacleaner-shared ./frontend/metacleaner-shared
COPY frontend/metacleaner-app/package.json ./frontend/metacleaner-app/
# Stubs for workspaces not needed at build time (bun requires all listed workspaces present)
COPY frontend/metacleaner-web/package.json ./frontend/metacleaner-web/
COPY terminal/metacleaner-cli/package.json ./terminal/metacleaner-cli/

RUN bun install --frozen-lockfile

COPY frontend/metacleaner-app/svelte.config.js \
     frontend/metacleaner-app/vite.config.ts \
     frontend/metacleaner-app/tsconfig.json \
     ./frontend/metacleaner-app/
COPY frontend/metacleaner-app/project.inlang ./frontend/metacleaner-app/project.inlang
COPY frontend/metacleaner-app/messages ./frontend/metacleaner-app/messages
COPY frontend/metacleaner-app/static ./frontend/metacleaner-app/static
COPY frontend/metacleaner-app/src ./frontend/metacleaner-app/src

WORKDIR /app/frontend/metacleaner-app
RUN bun run build

# Copy mediainfo.js WASM binary into the static build output.
# Vite does not auto-bundle dynamically loaded WASM files.
RUN cp /app/node_modules/mediainfo.js/dist/MediaInfoModule.wasm build/MediaInfoModule.wasm 2>/dev/null || \
    find /app/node_modules/mediainfo.js -name "*.wasm" -exec cp {} build/ \; 2>/dev/null || true

# Production stage — serve static SPA with nginx
FROM nginx:alpine
COPY --from=build /app/frontend/metacleaner-app/build /usr/share/nginx/html
COPY frontend/metacleaner-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

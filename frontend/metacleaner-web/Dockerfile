# Build stage — must be built from the workspace root:
#   docker build -f frontend/metacleaner-web/Dockerfile -t <name> .
FROM oven/bun:1 AS build
WORKDIR /app

ARG PUBLIC_APP_URL=https://app.metacleaner.com
ENV PUBLIC_APP_URL=$PUBLIC_APP_URL

# Copy workspace manifest files so bun can resolve the full workspace graph
COPY package.json bun.lock ./
COPY frontend/metacleaner-shared ./frontend/metacleaner-shared
COPY frontend/metacleaner-web/package.json ./frontend/metacleaner-web/
# Stubs for workspaces not needed at build time (bun requires all listed workspaces present)
COPY frontend/metacleaner-app/package.json ./frontend/metacleaner-app/
COPY terminal/metacleaner-cli/package.json ./terminal/metacleaner-cli/

RUN bun install --frozen-lockfile

COPY frontend/metacleaner-web/vite.config.ts \
     frontend/metacleaner-web/tsconfig.json \
     frontend/metacleaner-web/eslint.config.js \
     ./frontend/metacleaner-web/
COPY frontend/metacleaner-web/project.inlang ./frontend/metacleaner-web/project.inlang
COPY frontend/metacleaner-web/messages ./frontend/metacleaner-web/messages
COPY frontend/metacleaner-web/static ./frontend/metacleaner-web/static
COPY frontend/metacleaner-web/src ./frontend/metacleaner-web/src

WORKDIR /app/frontend/metacleaner-web
RUN bun run build

# Production stage — serve static site with nginx
FROM nginx:alpine
COPY --from=build /app/frontend/metacleaner-web/build /usr/share/nginx/html
COPY frontend/metacleaner-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

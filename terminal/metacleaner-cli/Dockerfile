# Build stage — must be built from workspace root:
#   docker build -f terminal/metacleaner-cli/Dockerfile -t metacleaner-cli .
FROM oven/bun:1 AS build
WORKDIR /app

# Copy workspace manifests for dependency install
COPY package.json bun.lock ./
COPY frontend/metacleaner-shared ./frontend/metacleaner-shared
COPY frontend/metacleaner-app/package.json ./frontend/metacleaner-app/
COPY terminal/metacleaner-cli/package.json ./terminal/metacleaner-cli/
# Stubs for workspaces not needed at build time (bun requires all listed workspaces present)
COPY frontend/metacleaner-web/package.json ./frontend/metacleaner-web/

RUN bun install --frozen-lockfile

# Copy source for both packages (CLI depends on metacleaner-app)
COPY frontend/metacleaner-app/src ./frontend/metacleaner-app/src
COPY terminal/metacleaner-cli/src ./terminal/metacleaner-cli/src
COPY terminal/metacleaner-cli/tsconfig.json ./terminal/metacleaner-cli/

# Bundle CLI into a single executable
RUN cd terminal/metacleaner-cli && \
    bun build src/index.ts --outfile /app/dist/metacleaner --target bun

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

COPY --from=build /app/dist/metacleaner ./metacleaner

ENTRYPOINT ["bun", "run", "/app/metacleaner"]
CMD ["help"]

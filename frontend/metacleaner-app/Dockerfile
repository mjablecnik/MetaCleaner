# Build stage
FROM oven/bun:1 AS build
WORKDIR /app

ARG PUBLIC_API_URL=http://localhost:8080
ENV PUBLIC_API_URL=$PUBLIC_API_URL

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY svelte.config.js vite.config.ts tsconfig.json ./
COPY project.inlang ./project.inlang
COPY messages ./messages
COPY static ./static
COPY src ./src

RUN bun run build

# Copy mediainfo.js WASM binary into the static build output.
# Vite does not auto-bundle dynamically loaded WASM files.
RUN cp node_modules/mediainfo.js/dist/MediaInfoModule.wasm build/MediaInfoModule.wasm 2>/dev/null || \
    find node_modules/mediainfo.js -name "*.wasm" -exec cp {} build/ \; 2>/dev/null || true

# Production stage — serve static SPA with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

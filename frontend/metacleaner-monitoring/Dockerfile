# Build stage
FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json bun.lock ./
RUN bun install

# Copy config files (change less frequently)
COPY vite.config.ts tsconfig.json eslint.config.js ./
COPY project.inlang ./project.inlang
COPY messages ./messages
COPY static ./static

# Copy source code (changes most frequently)
COPY src ./src

# Build the SvelteKit app
RUN bun run build

# Production stage — Node.js server (SvelteKit adapter-node output)
FROM node:22-slim
WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "build/index.js"]

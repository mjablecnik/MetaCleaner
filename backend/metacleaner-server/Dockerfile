# Builder stage
FROM golang:1.23-bookworm AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY src/ ./src/
COPY cmd/ ./cmd/
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o metacleaner-server ./cmd/

# Production stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    exiftool \
    ffmpeg \
    ca-certificates \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/metacleaner-server .

EXPOSE 8080

CMD ["./metacleaner-server"]

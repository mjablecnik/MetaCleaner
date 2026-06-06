# metacleaner-cli

A CLI tool for inspecting and cleaning file metadata using the MetaCleaner ecosystem.

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0

## Setup

```bash
# From the workspace root
bun install

# Or from this directory
cd terminal/metacleaner-cli
bun install
```

Copy the example environment file and adjust if needed:

```bash
cp .env.example .env
```

## Usage

### Scan files for metadata

```bash
bun run src/index.ts scan photo.jpg
bun run src/index.ts scan photo.jpg video.mp4 image.png
```

### Clean metadata via the backend server

```bash
bun run src/index.ts clean photo.jpg
bun run src/index.ts clean photo.jpg --output ./cleaned/
bun run src/index.ts clean photo.jpg --server http://localhost:8080
```

### Compare before/after metadata

```bash
bun run src/index.ts compare photo.jpg
bun run src/index.ts compare photo.jpg --json
```

### Display help

```bash
bun run src/index.ts help
bun run src/index.ts
```

## Global Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--server <url>` | `http://localhost:8080` | Backend server URL |
| `--json` | false | Output structured JSON |
| `--verbose` | false | Show additional parsing details |
| `--quiet` | false | One line per file (name, score, severity) |
| `--output <path>` | `<name>_cleaned.<ext>` | Output path for cleaned files |
| `--timeout <seconds>` | 60 | Max server polling wait time |
| `--version` | — | Print CLI version and exit |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success, no critical/high risk detected |
| 1 | At least one file has critical or high severity |
| 2 | Runtime error (file not found, server unreachable, timeout, etc.) |

## Running Tests

```bash
bun test
# or
bunx vitest --run
```

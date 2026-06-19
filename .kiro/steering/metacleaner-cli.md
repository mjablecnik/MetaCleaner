# MetaCleaner CLI — Architecture & Conventions

## Project Overview

MetaCleaner CLI is a TypeScript command-line tool for inspecting and cleaning file metadata. It reuses the frontend scanner modules directly via Bun workspace link for metadata extraction and risk analysis, and communicates with the Go backend server over HTTP for metadata cleaning operations.

The CLI lives in `terminal/metacleaner-cli/`.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict mode, ESNext target)
- **Package Manager**: bun (workspace linked to `frontend/metacleaner-app`)
- **Testing**: Vitest + fast-check (property-based tests)
- **Module**: ESM (`"type": "module"`)
- **Build**: None — runs directly via `bun run src/index.ts`

## Project Structure

```
terminal/metacleaner-cli/
├── src/
│   ├── index.ts          # Entry point — argument parsing, main()
│   ├── commands.ts       # Command router + executeScan/executeClean/executeCompare
│   ├── types.ts          # CLI interfaces + re-exports from frontend scanner types
│   ├── scanner.ts        # File adapter — reads FS files → Web File API → frontend scanner
│   ├── serverClient.ts   # HTTP client for backend API (upload, createJob, poll, download)
│   ├── formatter.ts      # Output formatting (human-readable, JSON, quiet modes)
│   ├── progress.ts       # Terminal progress indicator (spinner/text updates)
│   └── polyfills.ts      # Polyfills for Node.js APIs needed by scanner modules
├── tests/
│   ├── commands.test.ts
│   ├── formatter.test.ts
│   ├── progress.test.ts
│   ├── scanner.test.ts
│   └── serverClient.test.ts
├── images/               # Test fixture images
├── scripts/              # Utility scripts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env / .env.example
├── .gitignore
├── Dockerfile
└── README.md
```

## Architecture Patterns

### Workspace Link to Frontend

The CLI imports scanner modules directly from the frontend app via Bun workspace:

```json
// package.json
"dependencies": {
  "metacleaner-app": "workspace:*"
}
```

```typescript
// tsconfig.json paths
"paths": {
  "metacleaner-app/*": ["../../frontend/metacleaner-app/*"]
}
```

Types are re-exported from the frontend scanner:

```typescript
// types.ts
export type { ScanResult, MetadataField, RiskCategory } from 'metacleaner-app/src/lib/scanner/types.js';
```

### File Adapter Pattern

The frontend scanner expects Web `File` objects. The CLI bridges Node.js filesystem to the Web File API:

```typescript
// Read file from disk → create File object → pass to scanner
const buffer = readFileSync(filePath);
const file = new File([buffer], fileName, { type: mimeType });
const result = await parseFile(file, fileId);
```

### Server Communication

The CLI does NOT run exiftool/ffmpeg locally. It delegates cleaning to the backend:

1. `POST /api/upload` — upload file via FormData
2. `POST /api/jobs` — create cleaning job
3. `GET /api/jobs/{id}` — poll until completed/failed
4. `GET /api/files/{id}/download` — download cleaned file

```typescript
// serverClient.ts exports
export async function checkHealth(serverUrl: string): Promise<boolean>;
export async function uploadFiles(serverUrl: string, filePaths: string[]): Promise<UploadedFile[]>;
export async function createJob(serverUrl: string, fileIds: string[]): Promise<JobResponse>;
export async function waitForJob(serverUrl: string, jobId: string, timeout: number, progress: ProgressIndicator): Promise<JobStatus>;
export async function downloadFile(serverUrl: string, fileId: string, outputPath: string): Promise<void>;
```

### Command Pattern

Each command is an async function returning `CommandResult`:

```typescript
interface CommandResult {
  exitCode: number;    // 0=success, 1=risk detected, 2=runtime error
  results: FileResult[];
  summary?: AggregatedSummary;
}
```

Commands: `scan`, `clean`, `compare`, `help`, `version`

### Output Modes

Three output modes controlled by flags:
- **Default**: Human-readable with emoji, colored text, tables
- **JSON** (`--json`): Machine-readable JSON output
- **Quiet** (`--quiet`): One line per file (score + severity only)

### Error Handling

Custom error classes for typed error handling:

```typescript
export class TimeoutError extends Error {
  constructor(public readonly elapsedSeconds: number, public readonly timeoutSeconds: number) { ... }
}

export class ServerError extends Error {
  constructor(public readonly status: number, message: string) { ... }
}
```

## Commands

| Command | Description | Backend Required |
|---------|-------------|:---:|
| `scan` | Scan files, display metadata + risk assessment | No |
| `clean` | Upload files, clean metadata via backend, save cleaned files | Yes |
| `compare` | Scan before, clean via backend, scan after, show diff | Yes |
| `help` | Show usage information | No |
| `version` | Print version from package.json | No |

## CLI Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--server <url>` | Backend server URL | `$METACLEANER_SERVER_URL` or `http://localhost:8080` |
| `--json` | JSON output format | `false` |
| `--verbose` | Show additional detail | `false` |
| `--quiet` | Minimal output (one line per file) | `false` |
| `--output <path>` | Output path for cleaned files | current directory |
| `--timeout <sec>` | Server polling timeout | `60` |
| `--version` | Print version and exit | — |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success — all files processed, no risk detected |
| 1 | Risk detected — at least one file has metadata privacy risk |
| 2 | Runtime error — file not found, server unreachable, timeout, etc. |

## Testing Conventions

Tests live in `tests/` directory, using Vitest with `fast-check` for property-based tests:

```typescript
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
```

### Vitest Config

```typescript
// vitest.config.ts
export default defineConfig({
  resolve: {
    alias: {
      'metacleaner-app': resolve(__dirname, '../../frontend/metacleaner-app'),
    },
  },
  test: {
    environment: 'node',
  },
});
```

### Running Tests

```bash
cd terminal/metacleaner-cli
bun run test              # Run all tests (single run)
bun run test:watch        # Watch mode
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `METACLEANER_SERVER_URL` | Backend server URL | `http://localhost:8080` |

## Build & Run Commands

```bash
cd terminal/metacleaner-cli
bun install                     # Install deps (workspace link resolves frontend)
bun run test                    # Run tests
```

## Running the CLI

### Option 1: Standalone binary (recommended)

Build a self-contained binary via `build.sh`:

```bash
cd terminal/metacleaner-cli
chmod +x build.sh
./build.sh
```

Then run from anywhere:

```bash
./bin/metacleaner scan photo.jpg
./bin/metacleaner clean photo.jpg
./bin/metacleaner compare photo.jpg
./bin/metacleaner scan --json photo.jpg
./bin/metacleaner clean --output ./cleaned/ photo.jpg
./bin/metacleaner compare --timeout 120 large-video.mp4
```

The binary is standalone (includes Bun runtime) — no dependencies needed to run it.

### Option 2: `bun start` (from CLI project directory)

```bash
cd terminal/metacleaner-cli
bun start scan photo.jpg
bun start clean photo.jpg
bun start compare photo.jpg
```

### Option 3: Global `metacleaner` command (via `bun link`)

Run once to register the global alias:

```bash
cd terminal/metacleaner-cli
bun link
```

Then use from anywhere:

```bash
metacleaner scan photo.jpg
metacleaner clean photo.jpg
metacleaner compare photo.jpg
```

### Notes

- `scan` works offline (no backend needed)
- `clean` and `compare` require a running backend (default `http://localhost:8080` or env `METACLEANER_SERVER_URL`)
- The global `metacleaner` command is registered via the `"bin"` field in `package.json`
- The `bin/` directory is gitignored

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Workspace link to frontend scanner | Zero code duplication for metadata parsing + risk analysis |
| Server-based cleaning (not local exiftool) | Consistent results with backend; no tool installation requirement for CLI users |
| Bun runtime | Fast startup, native TypeScript execution, built-in File/FormData APIs |
| Minimal dependencies | Only vitest + fast-check as dev deps; all logic from frontend workspace |
| File adapter pattern | Bridges FS (Node) to Web File API expected by browser-oriented scanner |

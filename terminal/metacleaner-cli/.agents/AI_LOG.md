# AI Log

## 2026-06-10T14:03 — manual
- Improved metadata handling in `src/formatter.ts` with privacy categorization and raw metadata output support

## 2026-06-10T11:19 — manual
- Added meaningful download filename generation with IMG_/VID_ prefix in `src/formatter.ts`
- Updated formatter tests in `tests/formatter.test.ts`

## 2026-06-07T13:38 — manual
- Added metadata scanner for image files (`scripts/check_metadata.py`) with AI detection capabilities
- Added AI image detection module and integrated into image parsing logic
- Added AI origin scoring to metadata processing (`src/types.ts`, `src/formatter.ts`)
- Enhanced AI detection with additional metadata checks in `scripts/check_metadata.py`

## 2026-06-07T01:50 — manual
- Added Dockerfile for the CLI project
- Added `.gitignore` with build/dependency exclusions
- Updated `.agents/MEMORY.md` with project documentation

## 2026-06-06T23:46 — create-code
- Spec: metadata-inspect-cli
- Implemented CLI entry point with manual argument parsing (`src/index.ts`) — parses commands (scan, clean, compare, help, version) and global flags (--server, --json, --verbose, --quiet, --output, --timeout, --version)
- Implemented command router and handlers (`src/commands.ts`) — routes to scan, clean, compare, help, version commands
- Implemented file adapter and scanner module (`src/scanner.ts`) — creates File objects from disk paths, delegates to frontend scanner via bun workspace link
- Implemented server client module (`src/serverClient.ts`) — HTTP client for backend API (upload, job creation, polling, download)
- Implemented output formatter (`src/formatter.ts`) — human-readable and JSON output with emoji indicators, category grouping, risk scores, before/after comparison
- Implemented progress indicator (`src/progress.ts`) — stderr spinner with elapsed time for server operations
- Implemented CLI types (`src/types.ts`) — CLIOptions, CommandResult, FileResult interfaces
- Created project structure with package.json, tsconfig.json, .env.example, README.md, vitest.config.ts
- Created property tests for scanner (`tests/scanner.test.ts`) — extension detection, file adapter createFileFromPath
- Created property tests for formatter (`tests/formatter.test.ts`) — category grouping, score/severity display, conditional metadata display, aggregation summary, default cleaned file path, clean formatter, compare formatter, JSON round-trip, JSON multi-file structure, quiet mode format
- Created property tests for progress indicator (`tests/progress.test.ts`)
- Created unit tests for server client (`tests/serverClient.test.ts`)
- Created unit tests for command handlers (`tests/commands.test.ts`)
- Fixed code review findings: added vitest.config.ts with coverage settings, improved error handling in commands.ts with proper cleanup for compare failures, added input validation in scanner.ts, fixed formatter.ts string interpolation, added package description in package.json, documented backend service standards exception in README.md

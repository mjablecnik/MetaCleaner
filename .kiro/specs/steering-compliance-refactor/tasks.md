# Implementation Plan: Steering Compliance Refactor

## Overview

This plan covers refactoring the MetaCleaner CLI and Backend to comply with their respective steering files. The CLI (TypeScript/Bun) gets short flags, NO_COLOR support, TTY detection, ANSI colored output, SIGINT handling, an install script, and zsh completions. The Backend (Go 1.23) gets structured logging via `log/slog`, request ID middleware, and explicit timeouts on Supabase HTTP calls.

## Tasks

- [x] 1. CLI: Create output module and short flag support
  - [x] 1.1 Create `src/output.ts` with OutputConfig, detectOutputConfig, shouldUseColor, color wrappers, and emoji replacement
    - Implement `OutputConfig` interface with `noColor`, `stdoutTTY`, `stderrTTY`
    - Implement `detectOutputConfig()` checking `NO_COLOR` env and `process.stdout.isTTY` / `process.stderr.isTTY`
    - Implement `shouldUseColor(stream, config)` returning false when noColor or stream not TTY
    - Implement color wrappers (`red`, `yellow`, `green`, `cyan`) using ANSI codes 31/33/32/36 with reset code 0
    - Implement `emoji(symbol, config)` returning plain-text labels when colors disabled
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 1.2 Add short flag aliases (`-h`, `-v`, `-q`) to `parseArgs` in `src/index.ts`
    - Extend the argument parser to recognize `-h` (help), `-v` (version precedence), `-q` (quiet)
    - Ensure `-v` takes precedence over other commands/flags regardless of position
    - Ensure `-q` + `--verbose` conflict detection writes error to stderr and exits with code 2
    - Ignore unrecognized single-character flags (e.g., `-x`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x]* 1.3 Write property tests for short flag parsing (Properties 1–4)
    - **Property 1: Short flag equivalence** — `-h` produces help, `-q` produces quiet:true same as `--quiet`
    - **Property 2: `-v` flag precedence** — any array with `-v` always produces `command: 'version'`
    - **Property 3: Mutual exclusivity detection** — `-q` + `--verbose` always signals exit code 2
    - **Property 4: Unknown short flags ignored** — unrecognized `-X` does not alter parsed options
    - Use `fast-check` arbitraries for random argument arrays, min 100 iterations
    - Test file: `terminal/metacleaner-cli/tests/parseArgs.test.ts`
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

  - [x]* 1.4 Write property tests for output module (Properties 5–7)
    - **Property 5: Color suppression when disabled** — zero ANSI escape sequences in output
    - **Property 6: Correct ANSI wrapping when enabled** — output matches `\x1b[{code}m` + text + `\x1b[0m`
    - **Property 7: Emoji replacement when colors disabled** — only printable ASCII returned
    - Use `fast-check` string arbitraries, min 100 iterations
    - Test file: `terminal/metacleaner-cli/tests/output.test.ts`
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 2. CLI: Integrate output module into existing formatters and progress
  - [x] 2.1 Update `src/formatter.ts` to use `output.ts` color wrappers and emoji function
    - Replace hardcoded emoji characters with calls to `emoji(symbol, config)`
    - Wrap error/warning/success/info messages with appropriate color functions
    - Pass `OutputConfig` through format functions
    - _Requirements: 2.1, 2.2, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.2 Update `src/progress.ts` to suppress spinner when stderr is not TTY
    - Check `OutputConfig.stderrTTY` before rendering spinner animation
    - Suppress carriage return control characters when not TTY
    - _Requirements: 3.1_

  - [x] 2.3 Wire `OutputConfig` through `src/index.ts` and `src/commands.ts`
    - Call `detectOutputConfig()` at startup
    - Pass config to all formatting and progress functions
    - _Requirements: 2.1, 2.4, 3.2, 3.3, 3.4, 4.5_

- [x] 3. Checkpoint - Ensure CLI output and flag tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. CLI: Signal handling, install script, and completions
  - [x] 4.1 Create `src/signals.ts` with SIGINT handler and cleanup registry
    - Implement `registerCleanup(fn)`, `unregisterCleanup(fn)`, `installSignalHandler()`
    - On SIGINT: run all registered cleanups, write "Interrupted." to stderr, exit 130
    - Abort in-progress HTTP requests before performing cleanup
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.2 Integrate signal handler into `src/index.ts` and `src/commands.ts`
    - Call `installSignalHandler()` at startup
    - Register temp file cleanup during clean/compare operations
    - _Requirements: 5.1, 5.4_

  - [x] 4.3 Create `terminal/metacleaner-cli/install.sh`
    - Check `bin/metacleaner` exists, error with build.sh suggestion if not (exit 2)
    - Create `~/.local/bin/` if needed, copy binary with +x permissions
    - Check `completions/_metacleaner` exists, warn and skip if missing
    - Create `~/.zsh/completions/` if needed, copy completion file
    - Print summary of installed paths, exit 0
    - Script must be idempotent
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 4.4 Create `terminal/metacleaner-cli/completions/_metacleaner` zsh completion file
    - Begin with `#compdef metacleaner`
    - Use `_arguments` for subcommands: scan, clean, compare, help, version
    - Complete all global flags: `--server`, `--json`, `--verbose`, `--quiet`, `--output`, `--timeout`, `--version`, `--help`
    - Complete short flag aliases: `-h`, `-v`, `-q`
    - Offer file path completion for scan/clean/compare arguments
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x]* 4.5 Write unit tests for signal handler and install script validation
    - Test cleanup registry add/remove
    - Test that SIGINT produces exit code 130 and "Interrupted." message
    - Validate install.sh script content (error paths, idempotency)
    - Validate completions file starts with `#compdef metacleaner` and includes all commands/flags
    - _Requirements: 5.1, 5.2, 5.3, 6.5, 6.6, 7.1, 7.2, 7.3_

- [ ] 5. Checkpoint - Ensure all CLI tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Backend: Create structured logger and request ID middleware
  - [ ] 6.1 Create `source/logger.go` with InitLogger, LoggerFromContext, ContextWithLogger
    - Implement JSON handler (production: `APP_ENV=production`, Info level) and Text handler (development: Debug level)
    - Use `log/slog` package, set as default logger via `slog.SetDefault`
    - Store request-scoped logger in context via custom context key
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 6.2 Create `source/request_id.go` with GenerateRequestID and RequestIDMiddleware
    - Generate UUID v4 using `crypto/rand` (version 4 bits + variant bits)
    - Middleware: generate or pass through `X-Request-Id` header
    - Inject request-scoped logger with `requestId` attribute into context
    - Set `X-Request-Id` response header
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 6.3 Write property tests for request ID and logger (Properties 8–11)
    - **Property 8: Structured log JSON format in production** — output is valid JSON with time, level, msg keys
    - **Property 9: Request ID in response header** — UUID v4 format regex match
    - **Property 10: Request ID passthrough** — incoming X-Request-Id echoed exactly
    - **Property 11: Request ID propagation to logs** — requestId field in all log entries during request
    - Use `pgregory.net/rapid` for random strings and HTTP requests, min 100 iterations
    - Test file: `backend/metacleaner-server/tests/request_id_test.go`, `tests/logger_test.go`
    - **Validates: Requirements 8.2, 8.5, 9.1, 9.3, 9.4, 9.5**

- [ ] 7. Backend: Replace all log.* calls with slog and wire middleware
  - [ ] 7.1 Replace all `log.Printf`, `log.Println`, `log.Fatalf` calls in `source/main.go` with `slog` equivalents
    - Call `InitLogger()` at the start of `Run()`
    - Replace `log.Fatalf` with `slog.Error` + `os.Exit(1)`
    - Replace `log.Printf`/`log.Println` with `slog.Info`/`slog.Debug`
    - _Requirements: 8.1, 8.6_

  - [ ] 7.2 Replace all `log.*` calls in `source/config.go`, `source/router.go`, `source/supabase.go`, `source/supabase_auth.go`
    - Replace with appropriate `slog.Info`/`slog.Warn`/`slog.Error` calls
    - Ensure no passwords, tokens, API keys, or JWT secrets are logged
    - Use `LoggerFromContext(ctx)` where request context is available
    - _Requirements: 8.1, 8.5, 8.6_

  - [ ] 7.3 Replace `log.*` calls in remaining source files (`handlers.go`, `auth_handlers.go`, `auth_middleware.go`, `pipeline.go`, `cleanup.go`, `websocket.go`, `pdf.go`)
    - Use `LoggerFromContext(r.Context())` in HTTP handlers for request-scoped logging
    - Ensure sensitive data (credentials, tokens) is never logged
    - _Requirements: 8.1, 8.5, 8.6_

  - [ ] 7.4 Wire `RequestIDMiddleware` into the router middleware chain in `source/router.go`
    - Add RequestIDMiddleware before CORS and auth middleware
    - Ensure all downstream handlers receive request-scoped logger via context
    - _Requirements: 9.2, 9.3, 9.4_

- [ ] 8. Checkpoint - Ensure backend compiles and existing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Backend: Add Supabase timeout support
  - [ ] 9.1 Add `SupabaseTimeout` field to Config struct and parse `SUPABASE_TIMEOUT` env var in `source/config.go`
    - Default 10 seconds
    - Parse integer seconds from env var, fall back to default on invalid/non-positive/empty values
    - Add `SUPABASE_TIMEOUT` to `.env.example`
    - _Requirements: 10.2, 10.3, 10.4_

  - [ ] 9.2 Add `doWithTimeout` helper to `source/supabase.go` and wrap all `httpClient.Do` calls
    - Create `context.WithTimeout` with configured duration
    - Replace direct `httpClient.Do(req)` calls with timeout-wrapped version
    - Return `context.DeadlineExceeded` error on timeout
    - _Requirements: 10.1, 10.2, 10.5_

  - [ ] 9.3 Wrap all `httpClient.Do` calls in `source/supabase_auth.go` with timeout
    - Apply same `doWithTimeout` pattern to `doRequest` and direct `httpClient.Do` calls (CreateProfile, GetProfile)
    - Pass timeout from config through SupabaseAuthClient
    - _Requirements: 10.1, 10.5_

  - [ ]* 9.4 Write property test for Supabase timeout parsing (Property 12)
    - **Property 12: Supabase timeout parsing** — positive integer N → N seconds, else default 10s
    - Use `pgregory.net/rapid` for random strings and integers
    - Test file: `backend/metacleaner-server/tests/config_test.go`
    - **Validates: Requirements 10.2, 10.3, 10.4**

- [ ] 10. Backend: Update .env.example with new environment variables
  - [ ] 10.1 Add `APP_ENV`, `SUPABASE_TIMEOUT` to `.env.example` with placeholder values and comments
    - `APP_ENV=development` (controls JSON vs text log format)
    - `SUPABASE_TIMEOUT=10` (seconds, default)
    - _Requirements: 8.2, 8.3, 10.3_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- CLI tests use Vitest + fast-check (`terminal/metacleaner-cli/`)
- Backend tests use `go test` + pgregory.net/rapid (`backend/metacleaner-server/`)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "6.1"] },
    { "id": 1, "tasks": ["1.2", "1.4", "6.2"] },
    { "id": 2, "tasks": ["1.3", "2.1", "2.2", "6.3"] },
    { "id": 3, "tasks": ["2.3", "7.1", "7.2"] },
    { "id": 4, "tasks": ["4.1", "4.3", "4.4", "7.3", "7.4"] },
    { "id": 5, "tasks": ["4.2", "4.5", "9.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "10.1"] },
    { "id": 7, "tasks": ["9.4"] }
  ]
}
```

# Requirements Document

## Introduction

This specification covers a refactoring effort to bring the MetaCleaner CLI (`terminal/metacleaner-cli/`) and Backend (`backend/metacleaner-server/`) projects into full compliance with their respective steering files (coding standards). The CLI requires short flags, environment-aware output control, signal handling, an install script, and zsh completions. The Backend requires structured logging via `log/slog`, request ID middleware, and explicit timeouts on Supabase HTTP calls. The Frontend is already compliant and requires no changes.

## Glossary

- **CLI**: The MetaCleaner command-line interface program located at `terminal/metacleaner-cli/`
- **Backend**: The MetaCleaner Go HTTP server located at `backend/metacleaner-server/`
- **Argument_Parser**: The CLI module responsible for parsing command-line flags and arguments (`src/index.ts`)
- **Output_System**: The CLI module responsible for writing formatted messages to stdout/stderr (`src/formatter.ts`, `src/progress.ts`)
- **Logger**: The Backend logging subsystem responsible for emitting structured log entries
- **Request_ID_Middleware**: Backend HTTP middleware that generates and propagates a unique identifier per request
- **Supabase_Client**: The Backend HTTP client that communicates with Supabase PostgREST and Storage APIs (`source/supabase.go`)
- **Progress_Indicator**: The CLI spinner/animation component that displays progress on stderr
- **SIGINT_Handler**: The CLI signal handler for graceful interruption via Ctrl+C
- **Install_Script**: A shell script (`install.sh`) that installs the CLI binary and completions to the user's system
- **Zsh_Completions**: A zsh completion definition file providing tab-completion for all CLI subcommands and flags

## Requirements

### Requirement 1: CLI Short Flag Aliases

**User Story:** As a CLI user, I want short flag aliases for common options, so that I can type commands faster.

#### Acceptance Criteria

1. WHEN the user passes `-h` as a flag, THE Argument_Parser SHALL produce the same output to stdout and the same exit code as when `--help` is passed
2. WHEN the user passes `-v` as a flag anywhere in the argument list, THE Argument_Parser SHALL produce the same output to stdout and the same exit code as when `--version` is passed, taking precedence over other commands and flags
3. WHEN the user passes `-q` as a flag, THE Argument_Parser SHALL suppress all informational and progress output, emitting only command result data and critical error messages, identical to the behavior of `--quiet`
4. IF the user passes `-q` together with `--verbose`, THEN THE Argument_Parser SHALL write a mutual exclusivity error message to stderr and exit with code 2
5. IF the user passes an unrecognized single-character flag (e.g., `-x`), THEN THE Argument_Parser SHALL ignore it without producing an error, consistent with the handling of unrecognized long flags

### Requirement 2: NO_COLOR Environment Variable Support

**User Story:** As a CLI user, I want the tool to respect the NO_COLOR environment variable, so that I can disable colored output in environments where ANSI codes are unwanted.

#### Acceptance Criteria

1. WHEN the `NO_COLOR` environment variable is set (to any value, including an empty string), THE Output_System SHALL suppress all ANSI color escape sequences from stdout and stderr output
2. WHEN the `NO_COLOR` environment variable is set, THE Output_System SHALL replace all emoji characters in output with plain-text equivalents (e.g., severity indicators rendered as text labels such as "[critical]", "[success]", "[error]" instead of 🔴, ✅, ❌)
3. WHILE the `NO_COLOR` environment variable is not set and stdout is connected to a TTY, THE Output_System SHALL render ANSI colors and emoji as defined by the default human-readable output format
4. WHEN stdout is not connected to a TTY (piped output), THE Output_System SHALL suppress all ANSI color escape sequences and emoji characters regardless of the `NO_COLOR` variable

### Requirement 3: TTY Detection for Output

**User Story:** As a CLI user, I want the tool to automatically disable decorative output when piped, so that output is clean for automated processing.

#### Acceptance Criteria

1. WHEN stderr is not connected to a TTY, THE Progress_Indicator SHALL not render the spinner animation and SHALL not emit carriage return control characters
2. WHEN stderr is not connected to a TTY, THE Output_System SHALL suppress all ANSI escape sequences (including color, bold, underline, and cursor movement codes) from stderr output
3. WHEN stdout is not connected to a TTY, THE Output_System SHALL suppress all ANSI escape sequences (including color, bold, underline, and cursor movement codes) from stdout output
4. WHEN the `NO_COLOR` environment variable is set (any value including empty string), THE Output_System SHALL suppress all ANSI escape sequences from both stdout and stderr regardless of TTY status

### Requirement 4: ANSI Colored Output Wrappers

**User Story:** As a CLI user, I want error, warning, success, and informational messages to be color-coded, so that I can quickly distinguish message types visually.

#### Acceptance Criteria

1. THE Output_System SHALL wrap error messages (file-not-found errors, server errors, timeout errors, and usage errors) in ANSI red color codes (escape code 31) followed by a reset code (escape code 0)
2. THE Output_System SHALL wrap warning messages (risk-detected notices and deprecation notices) in ANSI yellow color codes (escape code 33) followed by a reset code (escape code 0)
3. THE Output_System SHALL wrap success messages (cleaning-complete confirmations and scan-complete confirmations) in ANSI green color codes (escape code 32) followed by a reset code (escape code 0)
4. THE Output_System SHALL wrap informational messages (progress status updates, summary headers, and help text) in ANSI cyan color codes (escape code 36) followed by a reset code (escape code 0)
5. WHILE the NO_COLOR environment variable is set (to any value, including empty string) or the target output stream (stdout for data output, stderr for log output) is not a TTY, THE Output_System SHALL omit all ANSI escape sequences and output plain undecorated text

### Requirement 5: SIGINT Graceful Handling

**User Story:** As a CLI user, I want the tool to exit cleanly when I press Ctrl+C, so that no temporary files are left behind.

#### Acceptance Criteria

1. WHEN a SIGINT signal is received, THE SIGINT_Handler SHALL remove any temporary files created in the system temp directory during the current operation (files matching the pattern `metacleaner_*` in the OS temp directory) and remove any partially written output files from an in-progress download
2. WHEN a SIGINT signal is received, THE SIGINT_Handler SHALL write the message "Interrupted." to stderr
3. WHEN a SIGINT signal is received, THE SIGINT_Handler SHALL exit the process with exit code 130
4. WHEN a SIGINT signal is received during an in-progress HTTP request (upload or polling), THE SIGINT_Handler SHALL abort the request before performing cleanup

### Requirement 6: CLI Installation Script

**User Story:** As a CLI user, I want an install script, so that I can install the CLI binary and completions to my system with a single command.

#### Acceptance Criteria

1. THE Install_Script SHALL create the target directories (`~/.local/bin/` and `~/.zsh/completions/`) if they do not already exist, then copy the compiled binary from `bin/metacleaner` to `~/.local/bin/metacleaner` with executable permissions
2. THE Install_Script SHALL copy the zsh completion file from the project's `completions/` directory to `~/.zsh/completions/`, creating the target directory if it does not exist
3. THE Install_Script SHALL be idempotent by overwriting any previously installed binary and completion file without producing errors on repeated runs
4. WHEN installation completes successfully, THE Install_Script SHALL print a summary listing each installed file path (binary and completion) and exit with code 0
5. IF the `bin/` directory does not contain the compiled binary, THEN THE Install_Script SHALL print an error message instructing the user to run `build.sh` first and exit with code 2
6. IF the zsh completion source file does not exist in the project's `completions/` directory, THEN THE Install_Script SHALL skip completion installation, print a warning, and continue with the binary installation

### Requirement 7: Zsh Completion File

**User Story:** As a CLI user, I want zsh tab-completion for commands and flags, so that I can discover and type commands efficiently.

#### Acceptance Criteria

1. THE Zsh_Completions SHALL be a valid zsh completion script beginning with `#compdef metacleaner` and using zsh completion system functions (`_arguments`, `_describe`, or equivalent)
2. THE Zsh_Completions SHALL provide completions for all subcommands: `scan`, `clean`, `compare`, `help`, `version`
3. THE Zsh_Completions SHALL provide completions for all global flags: `--server`, `--json`, `--verbose`, `--quiet`, `--output`, `--timeout`, `--version`, `--help`
4. THE Zsh_Completions SHALL provide completions for short flag aliases: `-h` (`--help`), `-v` (`--version`), `-q` (`--quiet`)
5. WHEN completing arguments for the `scan`, `clean`, or `compare` subcommands, THE Zsh_Completions SHALL offer file path completion
6. THE Zsh_Completions SHALL be located at `terminal/metacleaner-cli/completions/_metacleaner`

### Requirement 8: Backend Structured Logging

**User Story:** As a backend operator, I want structured log output, so that I can parse and search logs efficiently in production monitoring tools.

#### Acceptance Criteria

1. THE Logger SHALL use Go's `log/slog` package for all log output, replacing all existing `log.Printf`, `log.Println`, and `log.Fatalf` calls
2. WHILE running in production (environment variable `APP_ENV` equals `production`), THE Logger SHALL output logs in JSON format containing `timestamp` (ISO 8601), `level` (one of `debug`, `info`, `warn`, `error`), `message`, and `requestId` fields
3. WHILE running in development (environment variable `APP_ENV` does not equal `production`), THE Logger SHALL output logs in human-readable text format using `slog.TextHandler`
4. WHILE running in production, THE Logger SHALL set the minimum log level to `info`, suppressing `debug`-level messages
5. THE Logger SHALL include a `requestId` attribute in every log entry emitted during HTTP request handling, where the `requestId` is a unique identifier generated per incoming request and propagated through the request lifecycle
6. THE Logger SHALL not log passwords, authentication tokens, refresh tokens, API keys, or JWT secrets in any log entry at any level

### Requirement 9: Backend Request ID Middleware

**User Story:** As a backend operator, I want every HTTP request tagged with a unique identifier, so that I can trace a request through all related log entries.

#### Acceptance Criteria

1. WHEN an HTTP request is received, THE Request_ID_Middleware SHALL generate a request ID in UUID v4 format (36-character string including hyphens)
2. WHEN an HTTP request is received, THE Request_ID_Middleware SHALL add the request ID to the request context before passing the request to downstream handlers
3. WHEN an HTTP response is sent, THE Request_ID_Middleware SHALL include the request ID in the `X-Request-Id` response header
4. THE Logger SHALL include the request ID from context in the `requestId` field of all structured log entries emitted during request processing
5. IF the incoming HTTP request contains an `X-Request-Id` header with a non-empty value, THEN THE Request_ID_Middleware SHALL use the provided value as the request ID instead of generating a new one

### Requirement 10: Backend Explicit Timeouts on Supabase Calls

**User Story:** As a backend operator, I want explicit timeouts on all outbound Supabase HTTP calls, so that a slow or unresponsive dependency does not hang the server indefinitely.

#### Acceptance Criteria

1. THE Supabase_Client SHALL apply a `context.WithTimeout` to every outbound HTTP request to Supabase services (PostgREST, Storage, and Auth)
2. THE Supabase_Client SHALL use a default timeout of 10 seconds for all outbound calls
3. THE Supabase_Client SHALL allow the timeout duration to be configured via the `SUPABASE_TIMEOUT` environment variable (integer value in seconds)
4. IF the `SUPABASE_TIMEOUT` environment variable contains a non-numeric or non-positive value, THEN THE Supabase_Client SHALL ignore it and use the default 10-second timeout
5. IF a Supabase call exceeds the configured timeout, THEN THE Supabase_Client SHALL return a context deadline exceeded error to the caller

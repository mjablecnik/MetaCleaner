# Implementation Plan: metadata-inspect-cli

## Overview

Build a TypeScript CLI tool (`terminal/metacleaner-cli/`) using Bun that provides `scan`, `clean`, and `compare` commands for file metadata inspection and cleaning. The tool reuses the frontend scanner module via Bun workspace link and communicates with the Go backend server over HTTP for cleaning operations. Implementation uses Vitest + fast-check for property-based testing of 12 correctness properties.

## Tasks

- [x] 1. Set up project structure and workspace configuration
  - [x] 1.1 Create root-level Bun workspace configuration
    - Add `workspaces` field to root `package.json` linking `terminal/metacleaner-cli` and `frontend/metacleaner-app`
    - If no root `package.json` exists, create one with workspace definition
    - _Requirements: 1.2 (workspace link for scanner reuse)_

  - [x] 1.2 Create CLI package.json and tsconfig.json
    - Create `terminal/metacleaner-cli/package.json` with name `metacleaner-cli`, bin entry point, and dependencies on `metacleaner-app` (workspace link)
    - Add devDependencies: `vitest`, `fast-check`, `typescript`
    - Create `terminal/metacleaner-cli/tsconfig.json` with strict mode, Bun types, path aliases to frontend scanner
    - _Requirements: 1.2_

  - [x] 1.3 Create types.ts with CLI-specific interfaces
    - Define `CLIOptions`, `CommandResult`, `FileResult`, `CleanResult`, `CompareResult`, `AggregatedSummary`, `UploadedFile`, `JobResponse`, `JobStatus` interfaces
    - `CLIOptions` must include `timeout: number` (default 60) and command type must include `'version'`
    - Import and re-export necessary types from frontend scanner (`ScanResult`, `MetadataField`, `RiskCategory`, `SeverityLevel`, `FileType`)
    - _Requirements: 1.1, 1.3, 1.6, 2.4, 3.1, 6.7, 6.8, 9.1, 10.1_

  - [x] 1.4 Create .env.example and README.md
    - Create `.env.example` with `METACLEANER_SERVER_URL=http://localhost:8080`
    - Create `README.md` with project description, prerequisites (Bun), setup, usage examples for all commands and flags
    - _Requirements: 2.2, 4.1, 4.2_

- [x] 2. Implement CLI entry point and argument parsing
  - [x] 2.1 Implement index.ts entry point
    - Parse `process.argv` to extract command (scan/clean/compare/help/version), file paths, and flags (--server, --json, --verbose, --quiet, --output, --timeout, --version)
    - Handle `--version` flag: read version from package.json, print to stdout, exit 0
    - Handle `--timeout` flag: parse integer value, default to 60 seconds
    - Validate flag conflicts (--verbose + --quiet → exit code 2)
    - Delegate to command router with parsed `CLIOptions`
    - Set process exit code from `CommandResult.exitCode`
    - _Requirements: 4.1, 4.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 9.1, 10.1, 10.2, 10.3_

  - [x] 2.2 Implement help command output
    - Display usage info with all commands (scan, clean, compare, help) and all global flags (--server, --json, --verbose, --quiet, --output, --timeout, --version)
    - Include usage examples for each command
    - Show help when no arguments provided or unknown command given
    - Include --version flag in help output
    - _Requirements: 4.1, 4.2, 4.3, 9.2_

- [x] 3. Implement file adapter and scanner module
  - [x] 3.1 Implement scanner.ts file adapter
    - Implement `createFileFromPath(filePath)`: read file from disk using Bun APIs, create a `File`-compatible object with correct name, size, type, and `arrayBuffer()` method
    - Implement `scanFile(filePath)`: detect format from extension using `IMAGE_EXTENSIONS`/`VIDEO_EXTENSIONS` from frontend constants, create File object, call frontend `parseFile()`, return `ScanResult`
    - Implement `scanFiles(filePaths)`: iterate files, collect `FileResult[]`, continue on individual failures
    - Handle errors: file not found, unsupported format — report error per file, continue with remaining
    - _Requirements: 1.1, 1.2, 1.7, 1.8, 7.1, 7.2, 7.3_

  - [x]* 3.2 Write property test for extension detection (Property 11)
    - **Property 11: Extension detection correctness**
    - For any file extension in IMAGE_EXTENSIONS or VIDEO_EXTENSIONS, verify correct file type and format string returned
    - **Validates: Requirements 7.1**

  - [x]* 3.3 Write unit tests for file adapter
    - Test `createFileFromPath` with existing and non-existing files
    - Test format detection for all supported extensions
    - Test error handling for unsupported extensions
    - _Requirements: 1.7, 1.8, 7.1_

- [x] 4. Implement output formatter
  - [x] 4.1 Implement formatter.ts with all format modes
    - Implement `formatScanResult(result, options)`: human-readable with emoji indicators, fields grouped by category, score + severity display
    - Implement `formatCleanResult(result, options)`: show fields removed, GPS stripped status, size change
    - Implement `formatCompareResult(result, options)`: before/after diff with score change, GPS change, device change, field count change
    - Implement `formatSummary(results, options)`: aggregated summary for multi-file operations
    - Support JSON mode: structured JSON output matching frontend types
    - Support verbose mode: additional raw parser output details
    - Support quiet mode: single line per file with name, score, severity
    - Implement `computeAggregatedSummary(results)`: calculate maxRiskScore, gpsFileCount, totalFiles, successCount, errorCount
    - Implement exit code determination: error→2, high/critical risk→1, success→0
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 2.4, 3.1, 3.2, 5.1, 5.2, 5.3, 6.3, 6.4, 10.1, 10.2, 10.3_

  - [x]* 4.2 Write property test for scan formatter category grouping (Property 1)
    - **Property 1: Scan formatter groups fields by category**
    - Generate arrays of MetadataField with mixed categories, verify output has distinct sections per category and each field under correct section
    - **Validates: Requirements 1.1**

  - [x]* 4.3 Write property test for score and severity display (Property 2)
    - **Property 2: Scan formatter includes score and severity**
    - Generate ScanResult with fileScore 0–100, verify output contains numeric score and correct severity label
    - **Validates: Requirements 1.3**

  - [x]* 4.4 Write property test for conditional metadata display (Property 3)
    - **Property 3: Scan formatter includes conditional metadata when present**
    - Generate ScanResult with hasGps=true and GPS fields, verify GPS values in output; generate with device defined, verify device string in output
    - **Validates: Requirements 1.4, 1.5**

  - [x]* 4.5 Write property test for aggregation summary (Property 4)
    - **Property 4: Aggregation summary correctness**
    - Generate non-empty arrays of FileResult, verify maxRiskScore = max(fileScores), gpsFileCount = count(hasGps), totalFiles = array.length
    - **Validates: Requirements 1.6**

  - [x]* 4.6 Write property test for default cleaned file path (Property 5)
    - **Property 5: Default cleaned file path naming**
    - Generate file names with extensions, verify default output path equals `<name>_cleaned.<ext>`
    - **Validates: Requirements 2.3**

  - [x]* 4.7 Write property test for clean formatter (Property 6)
    - **Property 6: Clean formatter includes all required information**
    - Generate CleanResult objects, verify output contains fieldsRemoved, GPS stripped status, original and cleaned sizes
    - **Validates: Requirements 2.4**

  - [x]* 4.8 Write property test for compare formatter (Property 7)
    - **Property 7: Compare formatter includes all comparison data**
    - Generate CompareResult with before/after ScanResults, verify output includes score change, GPS change, device change, field count change
    - **Validates: Requirements 3.1, 3.2**

  - [x]* 4.9 Write property test for JSON round-trip (Property 8)
    - **Property 8: JSON output round-trip**
    - Generate valid ScanResult, format as JSON, parse back, verify structural equivalence
    - **Validates: Requirements 5.2**

  - [x]* 4.10 Write property test for JSON multi-file structure (Property 9)
    - **Property 9: JSON multi-file output structure**
    - Generate arrays of N FileResult (N≥1), verify JSON output has results array of length N and summary.totalFiles = N
    - **Validates: Requirements 5.3**

  - [x]* 4.11 Write property test for quiet mode format (Property 10)
    - **Property 10: Quiet mode single-line format**
    - Generate ScanResult, verify quiet mode produces exactly one line with file name, score, and severity label
    - **Validates: Requirements 6.4**

  - [x]* 4.12 Write property test for exit code determination (Property 12)
    - **Property 12: Exit code determination from results**
    - Generate arrays of FileResult: if any error → 2, else if any fileScore ≥ 50 → 1, else → 0
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [x] 5. Implement progress indicator module
  - [x] 5.1 Implement progress.ts spinner
    - Implement `ProgressIndicator` interface with `start(message)`, `update(message)`, `stop()` methods
    - Implement `createProgressIndicator(options)` factory that returns a no-op indicator when `options.quiet` or `options.json` is true
    - Render character-based spinner (⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏) with elapsed time on stderr
    - Clear spinner line before printing results
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x]* 5.2 Write unit tests for progress indicator
    - Test that createProgressIndicator returns no-op when quiet=true
    - Test that createProgressIndicator returns no-op when json=true
    - Test that active indicator writes to stderr (not stdout)
    - Test that stop() clears the spinner output
    - _Requirements: 8.2, 8.3, 8.4_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement server client
  - [x] 7.1 Implement serverClient.ts HTTP client
    - Implement `checkHealth(serverUrl)`: GET `/api/health`, return boolean
    - Implement `uploadFiles(serverUrl, filePaths)`: POST `/api/upload` with multipart form data, return `UploadedFile[]`
    - Implement `createJob(serverUrl, fileIds)`: POST `/api/jobs` with file IDs, return `JobResponse`
    - Implement `waitForJob(serverUrl, jobId, timeoutSeconds, progress)`: GET `/api/jobs/{jobId}` with polling until status is completed/failed or timeout exceeded; update progress indicator on each poll; if timeout exceeded throw a TimeoutError with elapsed time
    - Implement `downloadFile(serverUrl, fileId, outputPath)`: GET `/api/files/{id}/download`, write binary to disk
    - Handle connection errors, non-2xx responses, and timeouts
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 6.7, 6.8_

  - [x]* 7.2 Write unit tests for server client
    - Mock fetch responses for each endpoint
    - Test health check success and failure
    - Test upload request construction (multipart form data)
    - Test job polling logic (multiple status transitions)
    - Test timeout behavior: verify TimeoutError thrown when elapsed time exceeds timeout
    - Test error handling for connection refused, server errors
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 6.7, 6.8_

- [x] 8. Implement command router and command handlers
  - [x] 8.1 Implement commands.ts command router
    - Implement `executeCommand(options: CLIOptions): Promise<CommandResult>`
    - Route to scan, clean, compare, help, or version handler based on `options.command`
    - Handle `--version`: read version from package.json, print, return exit code 0
    - Handle unknown commands by showing help and returning exit code 2
    - _Requirements: 4.3, 9.1_

  - [x] 8.2 Implement scan command handler
    - Call `scanFiles()` with provided file paths
    - Format results using formatter with current format options
    - Output to stdout, errors to stderr
    - Compute exit code from results (risk detection)
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 8.3 Implement clean command handler
    - Check server health first (fail fast with clear message)
    - Create progress indicator (suppressed in --quiet/--json modes)
    - Upload files via server client
    - Create cleaning job and poll until completion with timeout and progress indicator
    - If timeout exceeded, stop progress, print timeout error, exit code 2
    - Download cleaned files to output path (default: `<name>_cleaned.<ext>`)
    - Format and display clean results
    - Handle server unreachable as fatal error for this command
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.7, 6.8, 8.1, 8.2, 8.3, 8.4_

  - [x] 8.4 Implement compare command handler
    - Scan original file(s) using scanner
    - Create progress indicator (suppressed in --quiet/--json modes)
    - Upload and clean via server (same flow as clean command) with timeout and progress
    - If timeout exceeded, stop progress, print timeout error, exit code 2
    - Scan cleaned file(s)
    - Build CompareResult with before/after data
    - Format and display comparison
    - Gracefully degrade to scan-only if server unreachable
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.7, 6.8, 8.1, 8.2, 8.3, 8.4_

  - [x]* 8.5 Write unit tests for command handlers
    - Test scan command with valid files, invalid files, mixed batch
    - Test clean command with mock server responses
    - Test clean command timeout behavior (exit code 2, timeout message)
    - Test compare command with mock server responses
    - Test compare command timeout behavior
    - Test --version command returns version from package.json
    - Test graceful degradation when server unreachable
    - _Requirements: 1.7, 1.8, 2.5, 3.4, 6.7, 6.8, 9.1_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 12 universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- The CLI uses Bun workspace link to import scanner logic directly from `frontend/metacleaner-app/src/lib/scanner/`
- All HTTP communication uses Bun's built-in `fetch` — no additional HTTP library needed
- Run tests with `bun test` or `bunx vitest --run` from the `terminal/metacleaner-cli/` directory

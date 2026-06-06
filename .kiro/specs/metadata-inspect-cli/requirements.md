# Requirements Document

## Introduction

A standalone CLI tool for developers to inspect, clean, and compare file metadata using the MetaCleaner ecosystem. The tool reuses the frontend's TypeScript-based metadata scanning logic (exifr, ExifReader, mediainfo.js) via bun workspace link for client-side analysis, and communicates with the running Go backend server via HTTP API for cleaning operations. It serves as a developer/testing utility to validate metadata presence and cleaning effectiveness.

**Project location:** `terminal/metacleaner-cli/`

## Glossary

- **CLI**: The metacleaner-cli command-line application, implemented in TypeScript and executed via bun
- **Scanner**: The metadata reading and analysis module imported from `frontend/metacleaner-app` via bun workspace link (`src/lib/scanner/`)
- **Risk_Analyzer**: The component that scores metadata fields by risk category (GPS 40%, device identity 25%, personal data 20%, timestamps 15%)
- **Metadata_Field**: A single key-value pair extracted from a file's embedded metadata
- **Risk_Score**: A numeric value (0–100) indicating the privacy risk level of a file's metadata
- **Severity_Level**: A classification of risk (critical, high, medium, low) derived from the Risk_Score
- **Backend_Server**: The running Go-based metacleaner-server that provides HTTP API endpoints for file upload and cleaning
- **Scan_Result**: The structured output containing all extracted metadata fields, GPS presence, device info, and risk scores

## Requirements

### Requirement 1: File Metadata Scanning (scan command)

**User Story:** As a developer, I want to scan files from the command line and see all detected metadata fields with risk assessment, so that I can verify what metadata is present before upload.

#### Acceptance Criteria

1. WHEN `metacleaner scan <files...>` is executed with valid file paths, THE CLI SHALL read each file and output all detected metadata fields grouped by category (GPS, device identity, personal data, timestamps)
2. WHEN a file is scanned, THE Scanner SHALL use the same parsing logic as the frontend imported via bun workspace link (exifr for JPEG/PNG/HEIC/HEIF/AVIF/TIFF/DNG, ExifReader for WebP/GIF, mediainfo.js for video formats)
3. WHEN a file is successfully scanned, THE CLI SHALL display the overall Risk_Score (0–100) and the Severity_Level (critical/high/medium/low) using the same weights as the frontend (GPS 40%, device 25%, personal 20%, timestamps 15%)
4. WHEN a file contains GPS metadata, THE CLI SHALL display latitude and longitude values
5. WHEN a file contains device identification metadata, THE CLI SHALL display the device make, model, and software
6. WHEN multiple file paths are provided, THE CLI SHALL scan each file and display results separately, followed by an aggregated summary
7. IF a file path does not exist, THEN THE CLI SHALL report the error for that file and continue processing remaining files
8. IF the file format is unsupported, THEN THE CLI SHALL report the error for that file and continue processing remaining files

### Requirement 2: Server-Based Metadata Cleaning (clean command)

**User Story:** As a developer, I want to clean metadata from files via the backend server API, so that I can verify the cleaning pipeline works correctly without using the web UI.

#### Acceptance Criteria

1. WHEN `metacleaner clean <files...>` is executed, THE CLI SHALL upload each file to the backend server via HTTP API and initiate the cleaning process
2. WHEN cleaning is initiated, THE CLI SHALL communicate with the server at the URL specified by the `--server` flag (default: `http://localhost:8080`)
3. WHEN cleaning completes successfully, THE CLI SHALL download the cleaned file and save it to a path specified by `--output` or to a default location (`<filename>_cleaned.<ext>` in the current directory)
4. WHEN cleaning completes, THE CLI SHALL display the number of fields removed, whether GPS was stripped, and file size change
5. IF the backend server is unreachable, THEN THE CLI SHALL exit with a non-zero code and print an error message indicating the server connection failed
6. IF the server returns an error during cleaning, THEN THE CLI SHALL display the error details and continue processing remaining files

### Requirement 3: Before/After Comparison (compare command)

**User Story:** As a developer, I want to see a side-by-side comparison of metadata before and after cleaning, so that I can verify exactly what the cleaning process removes.

#### Acceptance Criteria

1. WHEN `metacleaner compare <files...>` is executed, THE CLI SHALL perform a scan, then clean via the server, then scan the cleaned file, and display a before/after comparison
2. WHEN displaying the comparison, THE CLI SHALL show the risk score change, GPS status change, device info change, and field count change
3. WHEN comparing multiple files, THE CLI SHALL display comparison results for each file separately
4. IF the server is unreachable during compare, THEN THE CLI SHALL show scan results only and indicate that cleaning comparison is unavailable

### Requirement 4: Help Command and Usage

**User Story:** As a developer, I want a help command with usage examples, so that I can quickly learn how to use the tool.

#### Acceptance Criteria

1. WHEN `metacleaner help` is executed or `metacleaner` is run with no arguments, THE CLI SHALL display usage information including all commands and global flags
2. WHEN help is displayed, THE CLI SHALL include usage examples for scan, clean, and compare commands
3. WHEN an unknown command is provided, THE CLI SHALL display help information and exit with a non-zero code

### Requirement 5: Output Format Selection

**User Story:** As a developer, I want to choose between human-readable and JSON output, so that I can use the tool both interactively and in automated scripts.

#### Acceptance Criteria

1. THE CLI SHALL default to a human-readable formatted output with emoji indicators when no format flag is specified
2. WHEN the `--json` flag is provided, THE CLI SHALL output structured JSON matching the frontend ScanResult type structure
3. WHEN the `--json` flag is used with multiple files, THE CLI SHALL output a JSON array with results for each file plus a summary object

### Requirement 6: Global Flags

**User Story:** As a developer, I want global flags to control CLI behavior across all commands, so that I can customize the tool for different use cases.

#### Acceptance Criteria

1. THE CLI SHALL support a `--server <url>` flag to specify the backend server URL (default: `http://localhost:8080`)
2. THE CLI SHALL support a `--json` flag to switch output to JSON format
3. THE CLI SHALL support a `--verbose` flag to display additional information including raw parser output, parsing duration, and file size details
4. THE CLI SHALL support a `--quiet` flag to output only the Risk_Score and Severity_Level per file (one line per file)
5. THE CLI SHALL support an `--output <path>` flag to specify the output directory or file path for cleaned files
6. IF both `--verbose` and `--quiet` are provided, THEN THE CLI SHALL exit with a non-zero code and print a usage error
7. THE CLI SHALL support a `--timeout <seconds>` flag to specify the maximum server polling wait time in seconds (default: 60)
8. IF the server polling duration exceeds the timeout value, THEN THE CLI SHALL exit with code 2 and print a timeout error message indicating the elapsed time and configured timeout
9. THE CLI SHALL support a `--version` flag that prints the version string read from the CLI package.json file

### Requirement 7: File Format Detection

**User Story:** As a developer, I want the tool to automatically detect the file type from its extension, so that I do not need to specify it manually.

#### Acceptance Criteria

1. THE CLI SHALL detect the file type (image or video) based on the file extension using the same extension map as the frontend (IMAGE_EXTENSIONS, VIDEO_EXTENSIONS constants imported via workspace link)
2. THE CLI SHALL support all image formats supported by the frontend and backend: JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, GIF
3. THE CLI SHALL support all video formats supported by the frontend and backend: MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, MTS
4. THE CLI SHALL NOT support PDF files or any format not listed in criteria 7.2 and 7.3

### Requirement 8: Progress Indicator

**User Story:** As a developer, I want to see progress feedback while waiting for server operations, so that I know the CLI is working and has not hung.

#### Acceptance Criteria

1. WHILE the CLI is waiting for the server to complete a cleaning job (polling), THE CLI SHALL display a progress indicator (spinner or progress bar) on stderr
2. WHEN the `--quiet` flag is provided, THE CLI SHALL suppress the progress indicator
3. WHEN the `--json` flag is provided, THE CLI SHALL suppress the progress indicator
4. WHEN the server job completes or fails, THE CLI SHALL clear the progress indicator before displaying results

### Requirement 9: Version Display

**User Story:** As a developer, I want to check which version of the CLI I have installed, so that I can verify compatibility and report issues.

#### Acceptance Criteria

1. WHEN `metacleaner --version` is executed, THE CLI SHALL print the version string from the CLI package.json file and exit with code 0
2. WHEN help is displayed, THE CLI SHALL include the `--version` flag in the list of global flags

### Requirement 10: Exit Codes

**User Story:** As a developer, I want meaningful exit codes, so that I can use the tool in CI pipelines and shell scripts with conditional logic.

#### Acceptance Criteria

1. THE CLI SHALL exit with code 0 when all operations complete successfully and no file has a critical or high Severity_Level
2. THE CLI SHALL exit with code 1 when any scanned file has a critical or high Severity_Level (indicating metadata risk detected)
3. THE CLI SHALL exit with code 2 when a runtime error occurs (file not found, unsupported format, server unreachable, timeout exceeded)

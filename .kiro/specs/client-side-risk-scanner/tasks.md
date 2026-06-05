# Implementation Plan: Client-Side Risk Scanner

## Overview

This plan merges the file upload (step1) and risk analysis (step2) into a single unified page at `/`. A core scanner module handles client-side metadata extraction and risk scoring using exifr, ExifReader, and mediainfo.js. The reactive scanner store (Svelte 5 runes) drives the UI, which conditionally renders the risk panel alongside the upload zone.

## Tasks

- [x] 1. Install dependencies and set up scanner module structure
  - [x] 1.1 Install required packages (exifr, exifreader, mediainfo.js, fast-check)
    - Run `bun add exifr exifreader mediainfo.js` and `bun add -d fast-check`
    - _Requirements: 2.1, 2.2, 2.8_
  - [x] 1.2 Create scanner module directory and type definitions
    - Create `src/lib/scanner/types.ts` with all interfaces: `FileType`, `ImageFormat`, `VideoFormat`, `ScanStatus`, `SeverityLevel`, `RiskCategory`, `MetadataField`, `ScanResult`, `QueuedFile`, `AggregatedRisk`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x] 1.3 Create constants file with field mappings and scoring weights
    - Create `src/lib/scanner/constants.ts` with `GPS_FIELDS`, `DEVICE_FIELDS`, `PERSONAL_FIELDS`, `TIMESTAMP_FIELDS`, category weights (GPS 0.40, Device 0.25, Personal 0.20, Timestamps 0.15), severity thresholds, and supported format extension lists
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 2. Implement risk analyzer (pure scoring logic)
  - [x] 2.1 Implement `riskAnalyzer.ts` with scoring functions
    - Create `src/lib/scanner/riskAnalyzer.ts` implementing `computeFileScore(fields)`, `computeAggregatedRisk(results)`, and `classifySeverity(score)`
    - Per-file score formula: `(gps * 0.40) + (deviceIdentity * 0.25) + (personalData * 0.20) + (timestamps * 0.15)`
    - Aggregated score: `max(fileScores)` for non-empty arrays, 0 for empty
    - Severity levels: critical (75–100), high (50–74), medium (25–49), low (0–24)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x] 2.2 Write property tests for risk analyzer (Properties 1–5)
    - **Property 1: Category score computation is correct** — for any subset of category fields present, computed score equals sum of per-field weights, clamped [0, 100]
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
    - **Property 2: Per-file risk score is bounded** — for any valid metadata fields (including empty), per-file score is in [0, 100]
    - **Validates: Requirements 4.1**
    - **Property 3: Severity classification is exhaustive and correct** — for any score in [0, 100], returns exactly one level
    - **Validates: Requirements 4.7**
    - **Property 4: Aggregated score equals maximum file score** — for any non-empty array of scores, aggregated = max; for empty = 0
    - **Validates: Requirements 4.6, 5.3**
    - **Property 5: File queue mutation preserves aggregation invariant** — adding/removing files yields correct max recalculation
    - **Validates: Requirements 5.1, 5.2**

- [x] 3. Implement format detector and metadata parsers
  - [x] 3.1 Create format detector
    - Create `src/lib/scanner/parsers/formatDetector.ts` that determines `FileType` and specific format from file extension
    - Map extensions to formats: `.jpg/.jpeg` → jpeg, `.png` → png, `.heic/.heif` → heic, `.avif` → avif, `.tiff/.tif` → tiff, `.dng` → dng, `.webp` → webp, `.gif` → gif; video: `.mp4/.m4v` → mp4, `.mov` → mov, `.avi` → avi, `.mkv` → mkv, `.webm` → webm, `.wmv` → wmv, `.flv` → flv, `.3gp` → 3gp, `.mpg/.mpeg` → mpeg, `.ogv` → ogv, `.mts/.m2ts` → mts
    - Return `null` format for unsupported extensions
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22_
  - [x] 3.2 Create image parser with exifr and ExifReader
    - Create `src/lib/scanner/parsers/imageParser.ts`
    - Use exifr for JPEG, HEIC/HEIF, PNG, AVIF, TIFF, DNG — extract EXIF, XMP, IPTC segments
    - Use ExifReader for WebP, GIF — extract EXIF, XMP, comment blocks
    - Map raw metadata fields to `MetadataField[]` with correct category assignment using constants
    - Apply file size optimization: `file.slice(0, 524288)` for files > 200MB
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.8, 2.9, 2.10, 2.11, 2.12, 7.3_
  - [x] 3.3 Create video parser with lazy mediainfo.js WASM loading
    - Create `src/lib/scanner/parsers/videoParser.ts`
    - Implement lazy loading: `mediainfo.js` dynamically imported only on first video file
    - Cache the initialized MediaInfo instance for subsequent video files
    - Extract format, codec, duration, bitrate, resolution, embedded metadata tags
    - Map video metadata to `MetadataField[]` with category assignment
    - Apply file size optimization: `file.slice(0, 2097152)` for files > 200MB
    - _Requirements: 2.5, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22, 7.3_
  - [x] 3.4 Create metadata parser orchestrator
    - Create `src/lib/scanner/metadataParser.ts` implementing `parseFile(file, options?): Promise<ScanResult>`
    - Route to image or video parser based on format detector result
    - Return empty ScanResult (status 'done', 0 fields, score 0) for unsupported formats
    - Wrap all parser calls in try/catch — return error ScanResult (status 'error') on failure, never throw
    - _Requirements: 2.1, 2.6, 2.7, 7.2_
  - [x]* 3.5 Write property tests for parser error handling (Properties 6–8)
    - **Property 6: Unsupported file formats yield empty scan results** — any file with unsupported extension returns done status with 0 fields
    - **Validates: Requirements 2.6**
    - **Property 7: Corrupted files never crash the parser** — any random byte sequence returns valid or error ScanResult, never throws
    - **Validates: Requirements 2.7**
    - **Property 8: Large files read only header segments** — files > 200MB read at most 512KB (images) or 2MB (videos)
    - **Validates: Requirements 7.3**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement scanner store (reactive state management)
  - [x] 5.1 Create scanner store with Svelte 5 runes
    - Create `src/lib/scanner/scannerStore.svelte.ts`
    - Use `$state` for `files: QueuedFile[]` and scanning status
    - Use `$derived` for `aggregatedRisk`, `hasFiles`, `isScanning`
    - Implement `addFiles(fileList: FileList)` — assigns unique IDs, detects format, adds to queue, triggers async parsing
    - Implement `removeFile(fileId: string)` — removes file, recalculates aggregated risk
    - Implement `clearFiles()` — resets queue and scores
    - Process files sequentially (one at a time) to avoid UI thread blocking
    - On each file scan completion, update the file's `scanResult` and recompute `aggregatedRisk`
    - _Requirements: 3.1, 3.2, 3.4, 5.1, 5.2, 5.3, 7.1, 7.2_
  - [x]* 5.2 Write unit tests for scanner store
    - Test addFiles triggers scanning and updates state
    - Test removeFile recalculates aggregated risk correctly
    - Test clearFiles resets all state to initial values
    - Test sequential processing of multiple files
    - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3_

- [ ] 6. Refactor UI — merge upload and risk scanner into unified page
  - [ ] 6.1 Relocate step2 components to the root route
    - Move `RiskScoreRing.svelte`, `RiskBreakdownBar.svelte`, `BeforeAfterScore.svelte`, `FileListItemRisk.svelte` from `src/routes/step2/components/` to `src/routes/(step1)/components/`
    - Add new `ScanProgressIndicator.svelte` component in `src/routes/(step1)/components/`
    - _Requirements: 1.2, 6.1, 6.2_
  - [ ] 6.2 Create new sections for the unified page
    - Create `src/routes/(step1)/sections/RiskScannerCard.svelte` — desktop risk panel connected to `scannerStore`, showing score ring, category breakdown bars, and severity badge
    - Create `src/routes/(step1)/sections/FileListCard.svelte` — scrollable file list with name, size, format badge, metadata field count, GPS indicator, device identifier
    - Create `src/routes/(step1)/sections/MobileRiskBanner.svelte` — compact risk summary shown below 1024px with overall score and severity
    - All sections derive data from `scannerStore` using `$derived` runes
    - _Requirements: 1.2, 1.5, 4.7, 6.1, 6.2, 6.3, 9.1, 9.2, 9.3_
  - [ ] 6.3 Update UploadZoneCard to integrate with scanner store
    - Modify `UploadZoneCard.svelte` to call `scannerStore.addFiles()` on file drop/selection
    - Display per-file scanning indicator (pending/scanning/done/error states)
    - Support file removal via `scannerStore.removeFile()`
    - _Requirements: 3.1, 3.3, 5.1, 5.2_
  - [ ] 6.4 Rewrite the root `+page.svelte` for unified layout
    - Update `src/routes/+page.svelte` to render UploadZoneCard + conditionally show risk scanner panel
    - When `scannerStore.hasFiles` is false: show only upload zone (full width)
    - When `scannerStore.hasFiles` is true: show upload zone + risk scanner side-by-side on desktop (≥1024px), stacked on mobile (<1024px)
    - Include MobileRiskBanner between upload zone and file list on mobile
    - Include "Start Cleaning" button (enabled when hasFiles, disabled when empty)
    - On "Start Cleaning" click: navigate to step3 passing file queue
    - Remove the now-obsolete StatusCard from the layout
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2_

- [ ] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Wire scanning pipeline end-to-end and handle edge cases
  - [ ] 8.1 Implement scan progress indicator and file status states
    - Create `ScanProgressIndicator.svelte` showing pending/scanning/done/error per file
    - Files with `status: 'error'` display warning icon and "Could not scan" message
    - Error files contribute 0 to aggregated score
    - _Requirements: 3.3, 2.7_
  - [ ] 8.2 Handle edge cases in scanner store
    - Same file added twice: allowed (unique IDs)
    - Large batch (50+ files): sequential processing with progress
    - All files error: show "Scanning failed" state instead of breakdown
    - File added during active scan: queued and processed after current completes
    - _Requirements: 3.2, 5.4, 7.1_
  - [ ]* 8.3 Write integration tests for the scan pipeline
    - Test file upload → parse → score update flow
    - Test batch upload processes all files incrementally
    - Test remove file recalculates correctly
    - Test clear files resets UI state
    - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses TypeScript throughout — all code examples and implementations use TypeScript
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The step2 route can remain in place for now but the unified `/` page is the primary UX
- The `fileRepository.ts` mock data becomes obsolete once `scannerStore.svelte.ts` is in use

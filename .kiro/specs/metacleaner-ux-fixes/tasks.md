# Implementation Plan

## Overview

Fix 9 UX bugs in the MetaCleaner application spanning download behavior, navigation, report functionality, video file handling, and visual consistency. The bugs affect the cleaning workflow from upload through results and report viewing. Fixes follow the exploratory bugfix methodology: write tests to confirm bugs exist, write preservation tests to protect existing behavior, then implement fixes and validate.

## Tasks

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - MetaCleaner 9 UX Bugs
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the 9 bugs exist
  - **Scoped PBT Approach**: Scope properties to concrete failing cases for each bug
  - Test cases (write in `frontend/metacleaner-app/src/lib/services/apiCleaningService.test.ts` and related test files):
    - Test `computeIconColor('image')` returns `'blue'` (will fail — currently returns `'green'`)
    - Test `handleDownload()` with 1 file calls individual file download endpoint, not ZIP (will fail — always calls ZIP)
    - Test `navProps` returns `logoHref` when `path === '/'` AND `appState === 'success'` (will fail — returns `{}`)
    - Test `UserDropdown` renders "Report history" link (will fail — only has Settings/Logout)
    - Test `ReportDetailHeader` PDF button has onclick handler calling `getReportPdf` (will fail — no handler)
    - Test report detail back button calls `history.back()` (will fail — navigates to `/reports`)
    - Test `mapMetadataDetail()` includes `id3Fields` and `mp4AtomFields` from backend response (will fail — ignores them)
    - Test `parseVideo()` handles mediainfo.js initialization failure gracefully (may fail — throws unhandled)
    - Test report file details show original filename not hashed ID (will fail — shows `f-{hash}.*`)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root causes
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Existing Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Observe: `computeIconColor('video')` returns `'orange'` on unfixed code
    - Observe: `handleDownload()` with 2+ files calls `downloadJobZip(jobId)` on unfixed code
    - Observe: `navProps` returns no `logoHref` when `path === '/'` in idle/files-ready/processing/error states
    - Observe: `UserDropdown` renders "Settings" and "Logout" with correct labels
    - Observe: Image EXIF/XMP/GPS parsing via exifr continues to work correctly
    - Observe: Report list video/document icons display in orange color
    - Observe: Results page (Step5Success) displays original filenames correctly
  - Write property-based tests capturing observed behavior patterns (from Preservation Requirements 3.1–3.9):
    - For all file counts ≥ 2, download method produces ZIP via `downloadJobZip()`
    - For all file types in `['video', 'document']`, `computeIconColor` returns `'orange'`
    - For all non-success app states at path `/`, `navProps.logoHref` is undefined
    - For all dropdown renders, "Settings" and "Logout" items exist with correct href/action
    - For all image files uploaded, scanner parses EXIF/XMP/GPS without errors
    - Backend PDF generation pipeline (Supabase Storage upload) remains unchanged
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 3. Fix Bug 6 — Image icon color

  - [x] 3.1 Change `computeIconColor()` return value for images
    - File: `frontend/metacleaner-app/src/lib/services/apiCleaningService.ts`
    - Change: `type === 'image'` returns `'blue'` instead of `'green'`
    - Single line change: `return type === 'image' ? 'blue' : 'orange';`
    - _Bug_Condition: isBugCondition(input) where input.action == 'viewReportList' AND input.context.fileType == 'image' AND input.context.iconColor == 'green'_
    - _Expected_Behavior: computeIconColor('image') returns 'blue' (text-brand-blue)_
    - _Preservation: computeIconColor('video') and computeIconColor('document') continue to return 'orange'_
    - _Requirements: 2.6, 3.6_

- [x] 4. Fix Bug 1 — Single file direct download

  - [x] 4.1 Add conditional download logic in `handleDownload()`
    - File: `frontend/metacleaner-app/src/routes/sections/Step5Success/Step5Success.svelte`
    - Check `results.fileResults.length === 1` (or equivalent file count)
    - If single file: extract `fileId` from `results.fileResults[0].fileId`, call `api.downloadFile(fileId)` with original filename
    - If multiple files: keep existing `api.downloadResults(jobId)` → `downloadJobZip()` path
    - _Bug_Condition: isBugCondition(input) where input.action == 'download' AND input.context.cleanedFileCount == 1_
    - _Expected_Behavior: Single file downloads directly without ZIP wrapper_
    - _Preservation: Multi-file (2+) downloads continue to create ZIP archives_
    - _Requirements: 2.1, 3.1_

- [x] 5. Fix Bug 2 — Logo click resets app on success state

  - [x] 5.1 Update `navProps` derivation for success state at root path
    - File: `frontend/metacleaner-app/src/routes/+layout.svelte`
    - When `path === '/'` AND `appState.current === 'success'`, provide a logo click handler or `logoHref`
    - The handler should reset `appState` to idle and navigate to step 1 (upload view)
    - If `logoHref: '/'` doesn't trigger re-render (since already on `/`), use an `onLogoClick` callback that calls `appState.reset()` directly
    - _Bug_Condition: isBugCondition(input) where input.action == 'clickLogo' AND input.context.routePath == '/' AND input.context.appState == 'success'_
    - _Expected_Behavior: Logo click resets appState to idle and shows step 1_
    - _Preservation: Non-success states at root path keep current logo behavior (no link/no action)_
    - _Requirements: 2.2, 3.2_

- [x] 6. Fix Bug 3 — PDF download button functionality

  - [x] 6.1 Wire PDF download handler in `ReportDetailHeader`
    - File: `frontend/metacleaner-app/src/routes/report/sections/ReportDetailHeader.svelte`
    - Add `handleDownloadPdf()` function that calls `getReportPdf(reportId)`
    - Get `reportId` from the report detail data (prop or derived)
    - Initiate browser file download with the returned URL (fetch + blob or window.open)
    - Attach `onclick={handleDownloadPdf}` to both mobile and desktop PDF buttons
    - _Bug_Condition: isBugCondition(input) where input.action == 'clickPdfDownload' AND input.context.page == 'reportDetail'_
    - _Expected_Behavior: PDF download initiates via GET /api/reports/{id}/pdf_
    - _Preservation: Backend PDF generation pipeline (Supabase Storage) remains unchanged_
    - _Requirements: 2.3, 3.3_

- [x] 7. Fix Bug 4 — History-based back navigation

  - [x] 7.1 Replace hardcoded `backHref` with `history.back()` for report detail
    - File: `frontend/metacleaner-app/src/routes/+layout.svelte`
    - For the report detail route, replace `backHref: '/reports'` with a `backAction` callback
    - The callback calls `history.back()` to return to whatever page the user came from (results page or reports list)
    - Update NavBar to support `backAction` callback alongside or instead of `backHref`
    - _Bug_Condition: isBugCondition(input) where input.action == 'clickBackToResults' AND input.context.page == 'reportDetail'_
    - _Expected_Behavior: history.back() called, returning to previous page (preserving results context)_
    - _Preservation: Reports list page "Back to cleaning" button keeps its existing behavior_
    - _Requirements: 2.4, 3.4_

- [x] 8. Fix Bug 5 — Add "Report history" to user dropdown

  - [x] 8.1 Add "Report history" menu item to `UserDropdown`
    - File: `frontend/metacleaner-app/src/lib/shared/components/UserDropdown.svelte`
    - Add a new `<a>` element with `href={resolve('/reports')}` between email header and "Settings"
    - Use icon: `fa-solid fa-clock-rotate-left` (or similar history icon)
    - Add i18n key: `common.nav.reportHistory` to `messages/en.json` and `messages/cs.json`
    - _Bug_Condition: isBugCondition(input) where input.action == 'openUserDropdown' AND input.context.menuItems NOT CONTAINS 'reportHistory'_
    - _Expected_Behavior: Dropdown shows "Report history" option navigating to /reports_
    - _Preservation: Existing "Settings" and "Logout" options retain current functionality_
    - _Requirements: 2.5, 3.5_

- [ ] 9. Fix Bug 7 — Video parsing resilience

  - [ ] 9.1 Add error handling to `getMediaInfo()` and `parseVideo()`
    - File: `frontend/metacleaner-app/src/lib/scanner/parsers/videoParser.ts`
    - Reset cached `mediaInfoInstance` to `null` on failure so next call retries
    - Add try/catch in `getMediaInfo()` for WASM initialization errors
    - Add try/catch around `mi.analyzeData()` for runtime analysis failures
    - On failure: return empty/fallback result with appropriate status (not "Cannot scan" error)
    - _Bug_Condition: isBugCondition(input) where input.action == 'uploadVideo' AND input.context.scannerPhase == 'riskAnalysis'_
    - _Expected_Behavior: Video metadata parsed successfully or graceful fallback without "Nelze naskenovat" error_
    - _Preservation: Image file scanning (EXIF/XMP/GPS via exifr) continues to work correctly_
    - _Requirements: 2.7, 3.7_

- [ ] 10. Fix Bug 8 — Video metadata field display in report detail

  - [ ] 10.1 Extend `FileMetadataSection` type with video fields
    - File: `frontend/metacleaner-app/src/lib/types/report.ts`
    - Add `id3Fields: MetadataField[]` and `mp4AtomFields: MetadataField[]` to `FileMetadataSection`
    - _Requirements: 2.8_

  - [ ] 10.2 Map video-specific fields in `mapMetadataDetail()`
    - File: `frontend/metacleaner-app/src/lib/services/apiCleaningService.ts`
    - Include `md.id3Fields` and `md.mp4Atoms` from backend response in mapped output
    - _Requirements: 2.8_

  - [ ] 10.3 Render video metadata sections in `FileAccordionItem`
    - File: `frontend/metacleaner-app/src/routes/report/components/FileAccordionItem.svelte`
    - Add entries to `metaSections` array for ID3 and MP4 atoms
    - Use appropriate icons and translation keys for video-specific categories
    - _Bug_Condition: isBugCondition(input) where input.action == 'viewReportDetail' AND input.context.fileType == 'video' AND input.context.metadataFields == EMPTY_
    - _Expected_Behavior: Video reports show field-level metadata breakdown (ID3, MP4 atoms) same as images show GPS/EXIF/XMP_
    - _Preservation: Image report detail continues to show GPS/EXIF/XMP field-level breakdown_
    - _Requirements: 2.8, 3.8_

- [ ] 11. Fix Bug 9 — Original filenames in report detail

  - [ ] 11.1 Preserve original filename in backend report response
    - File: `backend/metacleaner-server/source/handlers.go` (and/or models/pipeline)
    - Ensure the original upload filename is stored and returned in the report file detail response
    - Add/use `original_name` field in file record that stores the name from upload
    - Include `original_name` in the report detail API response JSON
    - _Requirements: 2.9_

  - [ ] 11.2 Use original filename in frontend report detail mapping
    - File: `frontend/metacleaner-app/src/lib/services/apiCleaningService.ts`
    - In `mapReportFileDetails()`, use the `original_name` field from backend response instead of hashed `file_name`
    - _Bug_Condition: isBugCondition(input) where input.action == 'viewReportDetail' AND input.context.displayedFileName MATCHES /^f-[a-f0-9]+\./_
    - _Expected_Behavior: Report detail shows original upload filenames (e.g., "firefly-kling-3.0.mp4")_
    - _Preservation: Results page (Step5Success) continues to show filenames correctly_
    - _Requirements: 2.9, 3.9_

- [ ] 12. Verify bug condition exploration tests now pass

  - [ ] 12.1 Re-run bug condition tests after all fixes
    - **Property 1: Expected Behavior** - All 9 UX Bugs Fixed
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior for all 9 bugs
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run all bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms all bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [ ] 12.2 Verify preservation tests still pass
    - **Property 2: Preservation** - No Regressions
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fixes (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Run full test suite: `bun run test` in `frontend/metacleaner-app/`
  - Run backend tests: `go test ./...` in `backend/metacleaner-server/`
  - Ensure all tests pass, ask the user if questions arise

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2"] },
    { "id": 1, "tasks": ["3.1", "4.1", "5.1", "6.1", "7.1", "8.1", "9.1", "10.1", "10.2", "10.3", "11.1", "11.2"] },
    { "id": 2, "tasks": ["12.1", "12.2"] },
    { "id": 3, "tasks": ["13"] }
  ]
}
```

## Notes

- Tasks 1 and 2 must complete before any fix implementation begins
- Fix tasks 3–11 are independent and can be implemented in any order
- Bug 6 (icon color) is the simplest fix — a single line change — good starting point
- Bug 9 (filenames) requires both backend and frontend changes
- Bug 7 (video parsing) may need manual testing with actual MP4 files to verify WASM behavior
- All user-facing text must go through Paraglide i18n (`tx()` helper) — no hardcoded strings
- Frontend test runner: `bun run test` (Vitest)
- Backend test runner: `go test ./...` in `backend/metacleaner-server/`

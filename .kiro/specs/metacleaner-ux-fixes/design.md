# MetaCleaner UX Fixes — Bugfix Design

## Overview

This design addresses 9 UX bugs spanning download behavior, navigation, report detail display, video parsing, and visual consistency in the MetaCleaner SvelteKit 5 frontend. The bugs affect core user flows: file cleaning results, report viewing, and the scanner pipeline. The fix strategy is targeted and minimal — each bug has an isolated root cause in a specific component or service function, and all fixes can be applied without structural refactoring.

## Glossary

- **Bug_Condition (C)**: A compound condition — any of the 9 specific scenarios where user interaction produces incorrect behavior
- **Property (P)**: Correct behavior for each scenario as defined in requirements 2.1–2.9
- **Preservation**: Existing correct behaviors (multi-file ZIP, image parsing, mouse interactions, existing menu items) that must remain unchanged
- **`apiCleaningService`**: Service class in `src/lib/services/apiCleaningService.ts` handling cleaning jobs, downloads, and report data mapping
- **`computeIconColor`**: Function in `apiCleaningService.ts` that maps file type to icon color for report list cards
- **`navProps`**: Derived property in `+layout.svelte` that configures NavBar behavior per route
- **`appState`**: Svelte 5 rune-based store managing wizard step transitions (idle → files-ready → processing → error/success)
- **`scannerStore`**: Store managing uploaded files and their scan results
- **`mediainfo.js`**: Client-side WASM library for extracting video container metadata

## Bug Details

### Bug Condition

The bugs manifest across 9 distinct scenarios in the MetaCleaner frontend. They share a common theme: incomplete implementation of features that were partially built but not connected end-to-end.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UserInteraction
  OUTPUT: boolean

  RETURN (input.action == 'download' AND input.context.cleanedFileCount == 1)
         OR (input.action == 'clickLogo' AND input.context.routePath == '/' AND input.context.appState == 'success')
         OR (input.action == 'clickPdfDownload' AND input.context.page == 'reportDetail')
         OR (input.action == 'clickBackToResults' AND input.context.page == 'reportDetail')
         OR (input.action == 'openUserDropdown' AND input.context.menuItems NOT CONTAINS 'reportHistory')
         OR (input.action == 'viewReportList' AND input.context.fileType == 'image' AND input.context.iconColor == 'green')
         OR (input.action == 'uploadVideo' AND input.context.scannerPhase == 'riskAnalysis')
         OR (input.action == 'viewReportDetail' AND input.context.fileType == 'video' AND input.context.metadataFields == EMPTY)
         OR (input.action == 'viewReportDetail' AND input.context.displayedFileName MATCHES /^f-[a-f0-9]+\./)
END FUNCTION
```

### Examples

1. **Single file download**: User cleans 1 JPEG → clicks "Download" → receives `cleaned-files.zip` containing a single file instead of downloading `photo.jpg` directly
2. **Logo click on results**: User finishes cleaning at path `/` in success state → clicks logo → nothing happens (page stays on success view)
3. **PDF download**: User opens report detail → clicks "Stáhnout PDF" → nothing happens (button has no click handler)
4. **Back to results**: User navigates from results page to report detail → clicks "Zpět na výsledky" → lands on `/reports` list instead of returning to their specific results
5. **User dropdown**: User opens avatar dropdown → sees only "Settings" and "Logout" → no way to access report history from nav
6. **Icon color**: Report list shows image-type reports with green photo icon instead of blue
7. **Video parsing**: User uploads an MP4 → scanner shows "Nelze naskenovat" error → mediainfo.js fails without proper error handling
8. **Video metadata in report**: Report detail for video files shows no field-level breakdown (empty metadata sections)
9. **Hashed filenames**: Report detail shows `f-fbe455fb.mp4` instead of `firefly-kling-3.0.mp4`

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Multi-file (2+) downloads must continue creating ZIP archives via `GET /api/jobs/{jobId}/download`
- Image file scanning (EXIF/XMP/GPS parsing via exifr) must continue working correctly
- Image report detail must continue showing field-level metadata breakdown (GPS, EXIF, XMP categories)
- Existing "Settings" and "Logout" dropdown items must retain current functionality
- Video and document icons on report list must keep their current orange color
- Non-success states at root path (`/`) must keep current logo behavior (no link)
- Reports list "Back to cleaning" button must keep its current behavior (navigates to `/`)
- Backend PDF generation pipeline (Supabase Storage upload, report record update) must remain unchanged
- File names on the results page (Step5Success) must continue showing correctly

**Scope:**
All interactions that do NOT match the 9 bug conditions should be completely unaffected by these fixes. The fixes are isolated to:
- Download logic (conditional single-file vs ZIP)
- NavBar `logoHref` derivation in layout
- Report detail header button handlers
- UserDropdown menu items
- Icon color mapping function
- Video parser error handling
- Report detail metadata mapping for video files
- File name field in backend report response

## Hypothesized Root Cause

Based on the code analysis:

1. **Single file ZIP (Bug 1)**: `handleDownload()` in `Step5Success.svelte` unconditionally calls `apiCleaningService.downloadResults(jobId)` which uses `downloadJobZip()` — the single-file download path via `downloadFile(fileId)` is never called. The API client already has `downloadFile()` but the UI logic doesn't branch on file count.

2. **Logo click (Bug 2)**: In `+layout.svelte`, `navProps` returns empty object `{}` when `path === '/'`, meaning `logoHref` is undefined. The NavBar renders logo without an `<a>` tag when `logoHref` is falsy. It should detect the success state and provide a reset action regardless of path.

3. **PDF download (Bug 3)**: The PDF download buttons in `ReportDetailHeader.svelte` have no `onclick` handler — they're purely visual. The API client already has `getReportPdf(reportId)` that returns a redirect URL, but it's never called from the UI.

4. **Back to results (Bug 4)**: In `+layout.svelte`, the report detail route sets `backHref: '/reports'` (hardcoded). This navigates to the reports list instead of using `history.back()` to return to the actual previous page (which could be the results/success page).

5. **Missing "Report history" (Bug 5)**: `UserDropdown.svelte` only renders "Settings" and "Logout" items. The "Report history" option was never added to the dropdown menu.

6. **Green icon color (Bug 6)**: `computeIconColor()` in `apiCleaningService.ts` returns `'green'` for images and `'orange'` for videos. Per design requirements, images should use `'blue'` on the report history page.

7. **Video parsing failure (Bug 7)**: `parseVideo()` in `videoParser.ts` doesn't handle the case where `mediainfo.js` fails to initialize or throws during WASM loading. The `metadataParser.ts` catches errors but the WASM initialization of `MediaInfoFactory` may fail silently or throw an unhandled promise rejection that isn't caught properly. Additionally, the `getMediaInfo()` factory caches a single instance but doesn't handle re-initialization if the first call fails.

8. **Video metadata in report detail (Bug 8)**: `mapMetadataDetail()` in `apiCleaningService.ts` only maps `gpsFields`, `exifFields`, and `xmpFields` — it ignores `id3Fields` and `mp4Atoms` from the backend response. The `FileMetadataSection` type also lacks these fields. The `FileAccordionItem.svelte` only renders GPS/EXIF/XMP sections.

9. **Hashed filenames (Bug 9)**: The backend stores files with hashed names (e.g., `f-fbe455fb.mp4`) in the `file_name` field of the database record. The original upload name needs to be preserved and returned in the report detail response. The backend `UploadResponse` includes the original name but this mapping is lost when building report file details.

## Correctness Properties

Property 1: Bug Condition - Single File Direct Download

_For any_ download action where the cleaning result contains exactly 1 file, the fixed `handleDownload` function SHALL call the individual file download endpoint (`/api/files/{fileId}/download`) and trigger a browser download with the original filename, without creating a ZIP archive.

**Validates: Requirements 2.1**

Property 2: Bug Condition - Logo Reset on Success State

_For any_ logo click action where the app is in success state (regardless of route path), the fixed layout SHALL provide a `logoHref` or click handler that resets `appState` to idle and navigates to step 1.

**Validates: Requirements 2.2**

Property 3: Bug Condition - PDF Download Functionality

_For any_ click on the "Download PDF" button on the report detail page, the fixed `ReportDetailHeader` SHALL call `getReportPdf(reportId)` and initiate a file download in the browser.

**Validates: Requirements 2.3**

Property 4: Bug Condition - History-Based Back Navigation

_For any_ click on the "Back to results" button on the report detail page, the fixed implementation SHALL call `history.back()` instead of navigating to a hardcoded route.

**Validates: Requirements 2.4**

Property 5: Bug Condition - Report History Menu Item

_For any_ opening of the user dropdown menu, the fixed `UserDropdown` SHALL display a "Report history" option that navigates to `/reports`.

**Validates: Requirements 2.5**

Property 6: Bug Condition - Image Icon Color Blue

_For any_ image-type report entry displayed on the report history list, the fixed `computeIconColor` function SHALL return `'blue'` (not `'green'`).

**Validates: Requirements 2.6**

Property 7: Bug Condition - Video Parsing Resilience

_For any_ video file uploaded to the scanner, the fixed `parseVideo` function SHALL handle mediainfo.js initialization failures gracefully, retry initialization if needed, and successfully parse metadata without showing errors.

**Validates: Requirements 2.7**

Property 8: Bug Condition - Video Metadata Field Display

_For any_ video file in the report detail view, the fixed metadata mapping SHALL include video-specific fields (ID3, MP4 atoms) in the `FileMetadataSection` type and render them in `FileAccordionItem`.

**Validates: Requirements 2.8**

Property 9: Bug Condition - Original File Names in Report Detail

_For any_ file displayed in the report detail page, the fixed system SHALL show the original upload filename (as displayed on the results page) instead of the hashed internal ID.

**Validates: Requirements 2.9**

Property 10: Preservation - Multi-File ZIP Download

_For any_ download action where the cleaning result contains 2 or more files, the fixed `handleDownload` function SHALL continue to download a ZIP archive via `downloadJobZip(jobId)`, producing identical behavior to the original code.

**Validates: Requirements 3.1**

Property 11: Preservation - Existing Behaviors

_For any_ interaction that does NOT match one of the 9 bug conditions (image parsing, non-success logo behavior, existing dropdown items, video/document icon colors, results page filenames), the fixed code SHALL produce exactly the same behavior as the original code.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9**

## Fix Implementation

### Changes Required

**Bug 1 — Single file download**

**File**: `frontend/metacleaner-app/src/routes/sections/Step5Success/Step5Success.svelte`

**Function**: `handleDownload()`

**Specific Changes**:
1. **Check file count**: If `results.filesProcessed === 1` (or `files.length === 1`), use individual file download
2. **Get fileId**: Extract the single file's ID from `results.fileResults[0].fileId`
3. **Call `api.downloadFile(fileId)`**: Use the existing individual file download endpoint
4. **Set filename**: Use the original filename from `scannerStore.files[0].file.name` for the download attribute
5. **Keep ZIP logic**: For 2+ files, keep existing `downloadJobZip()` call

---

**Bug 2 — Logo click on results page**

**File**: `frontend/metacleaner-app/src/routes/+layout.svelte`

**Function**: `navProps` derived computation

**Specific Changes**:
1. **Detect success state**: When `path === '/'` AND `appState.current === 'success'`, set `logoHref` to `'/'`
2. **Alternative**: Add an `onLogoClick` callback prop to NavBar that calls `appState.reset()` and navigates to `/`
3. **Since logoHref already points to `/`**: The simplest fix is to provide `logoHref: '/'` when in success state — clicking the link navigates to `/` which triggers `beforeNavigate` to reset state (similar to reports page pattern). However, since we're already on `/`, we need a direct reset mechanism.

---

**Bug 3 — PDF download button**

**File**: `frontend/metacleaner-app/src/routes/report/sections/ReportDetailHeader.svelte`

**Specific Changes**:
1. **Add `reportId` prop or derive from `reportDetail`**: Get the report ID for the API call
2. **Add `handleDownloadPdf()` function**: Call `getReportPdf(reportId)` → get URL → trigger download via `window.open(url)` or fetch + blob download
3. **Attach `onclick={handleDownloadPdf}`**: Wire both mobile and desktop PDF buttons

---

**Bug 4 — Back to results navigation**

**File**: `frontend/metacleaner-app/src/routes/+layout.svelte`

**Function**: `navProps` for report detail route

**Specific Changes**:
1. **Change approach**: Instead of using `backHref` (which renders an `<a>` tag), use `history.back()` when coming from the results page
2. **Option A**: Remove `backHref` for report detail route and add a `backAction` callback that calls `history.back()`
3. **Option B**: Keep the NavBar `backHref` for desktop visual but override click behavior with `history.back()` in the component

---

**Bug 5 — User dropdown "Report history"**

**File**: `frontend/metacleaner-app/src/lib/shared/components/UserDropdown.svelte`

**Specific Changes**:
1. **Add a "Report history" menu item**: Insert a new `<a>` element (with `href={resolve('/reports')}`) between the email header and "Settings"
2. **Use icon**: `fa-solid fa-clock-rotate-left` (or `fa-file-lines`)
3. **Add i18n key**: Use `common.nav.reportHistory` message key

---

**Bug 6 — Image icon color**

**File**: `frontend/metacleaner-app/src/lib/services/apiCleaningService.ts`

**Function**: `computeIconColor()`

**Specific Changes**:
1. **Change return value**: `type === 'image'` should return `'blue'` instead of `'green'`
2. **Single line change**: `return type === 'image' ? 'blue' : 'orange';`

---

**Bug 7 — Video parsing failure**

**File**: `frontend/metacleaner-app/src/lib/scanner/parsers/videoParser.ts`

**Function**: `getMediaInfo()` and `parseVideo()`

**Specific Changes**:
1. **Reset cached instance on failure**: If `MediaInfoFactory()` throws, set `mediaInfoInstance = null` so next call retries
2. **Add try/catch in `getMediaInfo()`**: Catch WASM initialization errors
3. **Add try/catch around `mi.analyzeData()`**: Handle runtime analysis failures gracefully
4. **Return empty result on failure**: Instead of propagating the error, return `makeEmptyResult(fileId)` with a status that doesn't trigger "Cannot scan" UI

---

**Bug 8 — Video metadata in report detail**

**Files**: 
- `frontend/metacleaner-app/src/lib/types/report.ts` — add `id3Fields` and `mp4AtomFields` to `FileMetadataSection`
- `frontend/metacleaner-app/src/lib/services/apiCleaningService.ts` — map `id3Fields` and `mp4Atoms` in `mapMetadataDetail()`
- `frontend/metacleaner-app/src/routes/report/components/FileAccordionItem.svelte` — add video-specific metadata sections (ID3, MP4 atoms) to the render loop

**Specific Changes**:
1. **Extend `FileMetadataSection` type**: Add `id3Fields: MetadataField[]` and `mp4AtomFields: MetadataField[]`
2. **Map backend fields**: In `mapMetadataDetail()`, include `md.id3Fields` and `md.mp4Atoms`
3. **Add render sections**: In `FileAccordionItem`, add entries to `metaSections` array for ID3 and MP4 atoms with appropriate icons and translation keys

---

**Bug 9 — Hashed filenames in report detail**

**File**: `backend/metacleaner-server/source/handlers.go` (or report query logic)

**Specific Changes**:
1. **Preserve original filename**: The backend must store and return the original upload filename in the report file detail response
2. **Map in frontend**: Ensure `mapReportFileDetails()` uses the `original_name` field from backend instead of the hashed `file_name`
3. **Backend change**: Add/use an `original_name` column or field in the file record that stores the name from upload, and include it in the report detail API response

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing fixes. Confirm or refute the root cause analysis.

**Test Plan**: Write unit tests that exercise each bug scenario on the current unfixed code to observe failures and validate our root cause hypothesis.

**Test Cases**:
1. **Single file download test**: Call `handleDownload` with 1 file in results → assert download filename is NOT `.zip` (will fail on unfixed code)
2. **Logo click test**: Render layout with `path === '/'` and `appState === 'success'` → assert `logoHref` is defined (will fail on unfixed code)
3. **PDF button test**: Render `ReportDetailHeader` → click PDF button → assert `getReportPdf` was called (will fail on unfixed code — no handler)
4. **Back button test**: Simulate report detail back button click → assert `history.back()` called (will fail on unfixed code — navigates to `/reports`)
5. **Dropdown test**: Render `UserDropdown` → assert "Report history" link exists (will fail on unfixed code)
6. **Icon color test**: Call `computeIconColor('image')` → assert returns `'blue'` (will fail — returns `'green'`)
7. **Video parser test**: Call `parseVideo()` with a valid MP4 file → assert result has `status: 'done'` (may fail depending on WASM environment)
8. **Video metadata mapping test**: Call `mapMetadataDetail()` with `id3Fields` present → assert output includes ID3 data (will fail — ignores the field)
9. **Filename test**: Call `mapReportFileDetails()` with backend response → assert `name` shows original filename (will fail if backend sends hashed names)

**Expected Counterexamples**:
- `computeIconColor('image')` returns `'green'` instead of `'blue'`
- `navProps` returns `{}` (no logoHref) when at path `/` in success state
- PDF buttons have no click handler in rendered DOM
- Possible causes: incomplete feature implementation, wrong return values, missing UI handlers

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedComponent(input)
  ASSERT expectedBehavior(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (random file counts ≥ 2, random file types, random routes)
- It catches edge cases that manual unit tests might miss (e.g., boundary at exactly 2 files)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-bug-condition inputs, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Multi-file ZIP preservation**: For any file count ≥ 2, verify download still produces ZIP
2. **Image parsing preservation**: Verify image files still parse EXIF/XMP/GPS correctly after video parser changes
3. **Existing dropdown items preservation**: Verify "Settings" and "Logout" still render with correct labels and behavior
4. **Video/document icon preservation**: Verify `computeIconColor('video')` still returns `'orange'`
5. **Non-success logo preservation**: Verify logo has no link when at path `/` in idle/files-ready/processing/error states

### Unit Tests

- Test `computeIconColor()` returns `'blue'` for image, `'orange'` for video
- Test `handleDownload()` branches correctly on file count (1 vs 2+)
- Test `navProps` derivation for all route/state combinations
- Test `UserDropdown` renders all 3 menu items (Report history, Settings, Logout)
- Test `ReportDetailHeader` PDF button calls API on click
- Test `mapMetadataDetail()` maps all backend fields including ID3 and MP4 atoms
- Test `parseVideo()` returns valid result for MP4 and handles initialization failure gracefully
- Test back button triggers `history.back()`

### Property-Based Tests

- Generate random file counts (1–20) and verify download method selection is correct (single file → direct, multi → ZIP)
- Generate random file types ('image' | 'video') and verify `computeIconColor` returns expected color
- Generate random route paths and app states, verify `navProps.logoHref` is correctly determined
- Generate random `BackendMetadataDetail` objects with various field combinations and verify `mapMetadataDetail()` preserves all fields

### Integration Tests

- Test full cleaning flow → single file → download → verify Content-Type is not `application/zip`
- Test cleaning flow → results → click logo → verify app resets to idle state
- Test report detail page load → click PDF button → verify PDF download initiates
- Test navigation: results page → report detail → back button → verify returns to results
- Test report detail renders original filenames for both image and video files

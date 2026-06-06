# Implementation Plan: Design Alignment

## Overview

Realign the MetaCleaner SvelteKit 5 frontend with the reference HTML mockups across all app states (Steps 1–5, Reports list, Report detail). The implementation converts the multi-route wizard into an SPA state machine on a single page (`/`), introduces real file uploads with mocked server communication, and ensures all text flows through Paraglide i18n.

## Tasks

- [x] 1. Infrastructure — App State Machine and Service Layer
  - [x] 1.1 Create the `appState` store with state machine transitions
    - Create `src/lib/stores/appState.svelte.ts` with `AppState` type (`'idle' | 'files-ready' | 'processing' | 'error' | 'success'`)
    - Implement `$state`, `$derived` helpers (`isProcessing`, `hasFiles`), and `transitionTo()` / `reset()` actions
    - Wire `scannerStore.files.length > 0` to auto-transition between `idle` ↔ `files-ready`
    - _Requirements: 1.3, 5.1, 7.3, 19.7, 21.2_

  - [x] 1.2 Create the mock cleaning service layer
    - Create `src/lib/services/cleaningService.ts` with the `CleaningService` interface (analyzeFiles, startCleaning, getJobStatus, downloadResults)
    - Create `src/lib/services/mockCleaningService.ts` implementing the interface with simulated delays, progress updates, error scenarios, and mock report generation
    - _Requirements: 21.4, 21.5, 21.7_

  - [x] 1.3 Add all new i18n message keys
    - Add keys to `messages/en.json` and `messages/cs.json` for all new text: step1 status card, step3 processing badges/buttons, step4 error texts, step5 success texts, reports page headers, report detail texts, common actions (Zastavit, Zkusit znovu, Vymazat vše, etc.)
    - Ensure dynamic values use Paraglide interpolation parameters
    - _Requirements: 25.1, 25.2, 25.3, 25.4_

  - [x] 1.4 Add CSS animations to `layout.css`
    - Add `fadeInUp` keyframe and utility class with stagger delay variants (0.1s–0.4s)
    - Add `spin-slow` (2s linear infinite) for processing spinners
    - Add `pulse-ring` (scale 1→1.08, opacity 0.4→0.8) for processing/error ring
    - Add `checkPop` (scale 0→1.2→1) for success icon
    - Add `shake` (horizontal -4px/+4px oscillation) for error icon
    - Add `border-dance` (animated dashed border movement) for drop zone
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [x] 2. Checkpoint — Ensure infrastructure compiles
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Shared Components — NavBar and Elements
  - [x] 3.1 Update NavBar for hamburger menu on ALL mobile pages
    - Remove `mobileStyle` prop — hamburger menu is always shown on mobile
    - Add `showBackButton`, `backHref`, `backLabel` props for Reports/Report pages
    - Add `noPrint` class support for print styling
    - Ensure desktop shows: logo, language dropdown, user dropdown
    - Ensure mobile shows: logo (smaller h-9), hamburger button (right side), sticky top-0 with border-bottom
    - _Requirements: 3.1, 3.2, 3.3, 20.1, 20.2, 20.3_

  - [x] 3.2 Update MobileHamburgerMenu content
    - Ensure expanded menu contains: user info section, language options (CZ, EN, DE, SK) with checkmarks, settings option, logout option
    - Ensure hamburger icon animates to X (xmark) when open
    - _Requirements: 3.2, 3.3_

  - [x] 3.3 Create `MobileBottomCta` shared component
    - Create `src/lib/shared/components/MobileBottomCta.svelte` — fixed bottom bar with `children` snippet, border-top, navy-main background
    - Only visible on mobile (`lg:hidden`), always fixed at bottom with z-50
    - _Requirements: 6.3, 8.2, 12.3, 14.3_

  - [x] 3.4 Update `UploadZoneCard` for dual states and validation
    - Full drop zone state: file-arrow-up icon, "Přetáhněte soubory sem" primary text, "nebo klikněte pro výběr ze zařízení" secondary text, category pills (Fotografie, Videa, Max 500 MB / soubor), format badges (JPG, PNG, HEIC, MP4, MOV) in header
    - Compact "add more" state: shrinks to a plus icon with "Přidat další soubory" when files present
    - Mobile text variants ("Klepněte pro výběr souborů" / "nebo přetáhněte soubory sem")
    - Drag-over highlight (brighter border, background tint)
    - File type validation (JPG/PNG/HEIC/MP4/MOV only) and size validation (max 500 MB) — reject invalid files with Toast notification
    - Remove any "Možnosti" (Options) button references
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 4.3, 18.1, 18.2, 18.3_

  - [x] 3.5 Update `FileListCard` with remove buttons and state indicators
    - Add per-file remove button (X icon): visible on hover (desktop), always visible (mobile)
    - Implement 5 file row states: completed (green border/check), in-progress (blue border/spinner/progress), waiting (gray/50% opacity/clock), failed (red border/X), skipped (gray/ban icon)
    - Wire remove action to scannerStore — removing last file transitions to idle
    - Ensure GPS-warning files show red border accent
    - _Requirements: 5.4, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [x] 4. Checkpoint — Ensure shared components compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Step 1 — Idle State Section
  - [x] 5.1 Create `Step1Idle` section component
    - Create `src/routes/sections/Step1Idle/Step1Idle.svelte`
    - Desktop: two-column grid (55%/43%) with UploadZoneCard left, StatusCardIdle right
    - Mobile: single column with UploadZoneCard followed by StatusCardIdle
    - Disabled "Spustit čištění" button at bottom (desktop inline, mobile in MobileBottomCta)
    - _Requirements: 1.1, 1.2, 2.3, 4.1, 4.3_

  - [x] 5.2 Create `StatusCardIdle` component
    - Create `src/routes/sections/Step1Idle/StatusCardIdle.svelte`
    - Card with shield icon in rounded circle, "Čeká na soubory" badge, descriptive text prompting file upload
    - _Requirements: 1.2_

- [x] 6. Step 2 — Files-Ready State Section
  - [x] 6.1 Create `Step2FilesReady` section component
    - Create `src/routes/sections/Step2FilesReady/Step2FilesReady.svelte`
    - Desktop: two-column grid (55%/43%) with left (compact UploadZoneCard + FileListCard + enabled "Spustit čištění" button) and right (RiskScannerCard)
    - Mobile: compact UploadZoneCard, MobileRiskBanner (collapsible accordion), FileListCard, CTA hint card, fixed bottom "Spustit čištění" button
    - Wire "Spustit čištění" button to transition `appState` → `processing`
    - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_

  - [x] 6.2 Update `RiskScannerCard` to match design mockup
    - Show "Risk Scanner" title with severity badge ("Vysoké riziko" etc.)
    - SVG score ring displaying aggregated risk score from scannerStore
    - Severity description with category chips
    - Risk breakdown bars per category (GPS, device, personal, timestamps)
    - Before/after score comparison section
    - CTA hint text at bottom
    - _Requirements: 5.3, 24.5_

  - [x] 6.3 Update `MobileRiskBanner` as collapsible accordion
    - Collapsed header: SVG score circle, "Risk Scanner" title, severity badge, category chips
    - Expanded body: risk breakdown bars, before/after scores
    - Chevron rotation animation on expand/collapse
    - _Requirements: 6.2_

- [x] 7. Step 3 — Processing State Section
  - [x] 7.1 Create `Step3Processing` section component
    - Create `src/routes/sections/Step3Processing/Step3Processing.svelte`
    - Desktop: "Probíhá čištění..." badge in header, two-column layout
    - Mobile: "Probíhá..." badge, single-column stacked layout
    - Start mock cleaning service on mount, update progress reactively
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2_

  - [x] 7.2 Create `ProcessingFilesCard` component
    - "Soubory ke zpracování" header with "Zpracovávám" spinning badge
    - Overall progress bar with percentage and time remaining
    - Per-file status rows (completed/in-progress/waiting/failed states)
    - Red "Zastavit" button — cancels processing and transitions to `files-ready`
    - _Requirements: 7.2, 7.3_

  - [x] 7.3 Create `ProcessingStatusCard` component (desktop)
    - "Stav zpracování" header with "Probíhá" spinning badge
    - Animated processing visual: pulsing ring, shield icon, spinning notch badge
    - Current file label
    - Live stats grid (3 columns: files count, fields removed, files completed)
    - "Průběžný log" section with timestamped entries
    - _Requirements: 7.3_

  - [x] 7.4 Create mobile processing components
    - Mobile status card: compact animated icon with file label, live stats grid
    - Activity log accordion: collapsed by default, chevron toggle, timestamped entries
    - _Requirements: 8.2, 8.3_

- [x] 8. Step 4 — Error State Section
  - [x] 8.1 Create `Step4Error` section component
    - Create `src/routes/sections/Step4Error/Step4Error.svelte`
    - Desktop: "Chyba zpracování" badge, full-width error banner, two-column layout (ErrorFilesCard left, ErrorStateCard right)
    - Mobile: "Chyba" badge, compact error banner, error visual card, files card, accordion sections
    - _Requirements: 9.1, 9.2, 10.1_

  - [x] 8.2 Create `ErrorBanner` component
    - Full-width banner: warning triangle icon, "Proces čištění selhal" title, error code badge, description text, dismiss X button
    - _Requirements: 9.2_

  - [x] 8.3 Create `ErrorFilesCard` component
    - Overall red progress bar with "Přerušeno" label
    - Per-file status rows (completed/failed/skipped states)
    - Action buttons: "Zkusit znovu" (transitions to files-ready) + "Vymazat vše" (transitions to idle)
    - _Requirements: 9.3_

  - [x] 8.4 Create `ErrorStateCard` component (desktop)
    - Animated error visual: pulsing ring, shaking triangle icon, red X badge
    - Failed file name display
    - Error detail box: grid with error code, time, file, phase
    - Error type selector: radio-style list (Cleaning Process Failed, Connection Error, Timeout)
    - Log section with timestamped entries
    - _Requirements: 9.4_

  - [x] 8.5 Create mobile error accordions
    - `ErrorDetailAccordion`, `ErrorTypeAccordion`, `ErrorLogAccordion` — independently expandable/collapsible with chevron rotation
    - Mobile error visual card: pulsing ring with shaking triangle, failed file info, red progress bar
    - _Requirements: 10.2, 10.3_

- [x] 9. Checkpoint — Ensure Steps 1–4 compile and state transitions work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Step 5 — Success State Section
  - [x] 10.1 Create `Step5Success` section component
    - Create `src/routes/sections/Step5Success/Step5Success.svelte`
    - Desktop: full-width layout with SuccessHeader, stat cards row, MetadataOverview, FileResultsCard
    - Mobile: SuccessHeader (smaller icon), 2×2 stat grid, collapsible MetadataOverview accordion, stacked file results, fixed bottom CTA bar
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3_

  - [x] 10.2 Create `SuccessHeader` component
    - Animated check icon with `checkPop` animation
    - "Čištění dokončeno!" title, metadata removal count subtitle
    - "Nahrát nové soubory" button (transitions to idle)
    - "100% Úspěšně dokončeno" badge
    - _Requirements: 11.1_

  - [x] 10.3 Create `MetadataOverview` component
    - Desktop: two-column Before/After grid — "Před čištěním" (red border, warning icon, GPS/EXIF/XMP/Other counts) and "Po čištění" (green border, shield icon, "Odstraněno" with check marks)
    - Mobile: tab buttons ("Před čištěním" / "Po čištění") switching panels inside an accordion (open by default)
    - _Requirements: 11.3, 12.2_

  - [x] 10.4 Create `FileResultsCard` component
    - Desktop: 2-column grid of file result items (icon, name, size, type badge, check, metadata chips)
    - Mobile: stacked single-column list
    - Action buttons: "Stáhnout vše (ZIP)" + "Zobrazit report" (navigates to `/report`)
    - _Requirements: 11.4, 23.1_

- [x] 11. Wire Main Page SPA Router
  - [x] 11.1 Rewrite `src/routes/+page.svelte` as SPA state dispatcher
    - Replace current content with conditional rendering based on `appState` store
    - Render: `Step1Idle` | `Step2FilesReady` | `Step3Processing` | `Step4Error` | `Step5Success`
    - No route navigation for state transitions — only content area re-renders
    - _Requirements: 1.3, 22.1_

- [x] 12. Reports and Report Detail Pages
  - [x] 12.1 Update `/reports` page to match desktop table and mobile card layout
    - Desktop: page header (history icon, "Historie reportů", subtitle, "Nové čištění" button), 4 stat cards row, filter/search bar, reports table with columns (ID, Datum, Soubory, Pole, Typy, Status, Akce)
    - Mobile: compact header, 2×2 stat grid, search input, scrollable filter buttons, card-based report list, fixed bottom "Nové čištění" CTA
    - Use mock data from mockCleaningService
    - NavBar with back button ("Zpět na čištění")
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 14.1, 14.2, 14.3, 20.2_

  - [x] 12.2 Update `/report` page to match design
    - Desktop: NavBar with back button, report header (file-lines icon, title, date/file/field subtitle, PDF download + Print buttons), meta info bar (4 columns), stat cards, two-column chart section, per-file accordion section with GPS/EXIF/XMP tables (red strikethrough for removed values)
    - Mobile: compact header, 2×2 meta grid, 2×2 stat cards, metadata distribution card, per-file breakdown, file accordions
    - NavBar with "Zpět na výsledky" back button
    - Use mock report data generated from processed files
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 16.1, 16.2, 16.3, 20.2, 23.1, 23.2, 23.3_

- [x] 13. Client-Side Risk Scanner Integration
  - [x] 13.1 Wire scannerStore to file upload flow
    - Ensure `UploadZoneCard` calls `scannerStore.addFiles()` when files are selected/dropped
    - Ensure file removal calls `scannerStore.removeFile()`
    - Verify metadata extraction triggers automatically on file add (within 100ms)
    - Ensure RiskScannerCard and MobileRiskBanner read from scannerStore reactive state
    - Ensure UI updates within 200ms of re-computation
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8_

- [x] 14. Route Cleanup — Delete Old Step Routes
  - [x] 14.1 Delete `src/routes/step2/` directory and all its contents
    - _Requirements: 22.1_

  - [x] 14.2 Delete `src/routes/step3/` directory and all its contents
    - _Requirements: 22.1_

  - [x] 14.3 Delete `src/routes/step4/` directory and all its contents
    - _Requirements: 22.1_

  - [x] 14.4 Delete `src/routes/step5/` directory and all its contents
    - _Requirements: 22.1_

  - [x] 14.5 Remove dead code and unused imports
    - Remove components, stores, utilities exclusively used by old step routes
    - Remove any hardcoded mock file data from repositories
    - Ensure no dead imports, unused variables, or orphaned files remain
    - _Requirements: 22.2, 22.3, 22.4_

- [x] 15. Checkpoint — Full app compiles, no dead code
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Component Tests (Vitest)
  - [x]* 16.1 Write component tests for NavBar (hamburger menu on mobile, dropdowns on desktop, back button)
    - Test hamburger renders on mobile, language+user dropdowns on desktop
    - Test back button renders when `showBackButton` prop is true
    - _Requirements: 20.1, 20.2, 20.3, 26.1, 26.4_

  - [x]* 16.2 Write component tests for UploadZoneCard (full/compact states, drag-over, validation)
    - Test full drop zone when no files, compact "add more" when files present
    - Test drag-over highlight class applied
    - Test invalid file type rejection with toast
    - Test file size > 500 MB rejection with toast
    - _Requirements: 2.1, 2.4, 2.5, 18.1, 18.2, 18.3, 26.4_

  - [x]* 16.3 Write component tests for FileListCard (file states, remove, last-file transition)
    - Test each of 5 file row states renders correctly
    - Test remove button visibility (hover on desktop, always on mobile)
    - Test removing last file transitions appState to idle
    - _Requirements: 19.1–19.7, 26.4_

  - [x]* 16.4 Write component tests for Step3Processing (progress, cancel)
    - Test "Zastavit" button transitions back to files-ready state
    - Test progress bar updates, per-file status indicators
    - _Requirements: 7.2, 7.3, 26.4_

  - [x]* 16.5 Write component tests for Step4Error (banner, retry, clear)
    - Test error banner renders with code and description
    - Test "Zkusit znovu" transitions to files-ready
    - Test "Vymazat vše" transitions to idle
    - _Requirements: 9.2, 9.3, 26.4_

  - [x]* 16.6 Write component tests for Step5Success (animation classes, tabs, navigation)
    - Test checkPop animation class on success icon
    - Test MetadataOverview desktop shows two columns, mobile shows tabs
    - Test "Zobrazit report" triggers navigation to `/report`
    - _Requirements: 11.1, 11.3, 12.2, 23.1, 26.4_

  - [x]* 16.7 Write component tests for appState store transitions
    - Test idle→files-ready on file upload
    - Test files-ready→processing on start cleaning
    - Test processing→files-ready on cancel (Zastavit)
    - Test processing→error and processing→success transitions
    - Test error→files-ready (retry) and error→idle (clear all)
    - _Requirements: 26.4_

  - [x]* 16.8 Update existing component tests for design-aligned markup
    - Update all tests referencing changed text, CSS classes, DOM structure
    - Ensure `bun run test` passes without failures
    - _Requirements: 26.1, 26.2, 26.3_

- [ ] 17. E2E Tests (Playwright)
  - [x]* 17.1 Write E2E test for Step 1 → Step 2 transition (upload files, verify in-place re-render)
    - Desktop: upload files, verify two-column layout with risk scanner appears without URL change
    - Mobile: verify risk banner and file list appear
    - _Requirements: 27.1, 27.2_

  - [x]* 17.2 Write E2E test for file validation (reject invalid type/size)
    - Upload unsupported file type, verify error toast and file not added
    - Upload >500MB file, verify error toast and file not added
    - _Requirements: 18.1, 18.2, 27.5_

  - [x]* 17.3 Write E2E test for file removal and last-file transition
    - Remove files one by one, verify list updates
    - Remove last file, verify idle state returns
    - _Requirements: 19.6, 19.7, 27.5_

  - [x]* 17.4 Write E2E test for Step 2 → Step 3 → Step 5 complete flow
    - Click "Spustit čištění", verify processing state on same page
    - Wait for completion, verify success state renders
    - Verify URL remains `/` throughout
    - _Requirements: 27.1, 27.2, 27.5_

  - [x]* 17.5 Write E2E test for Step 3 cancel (Zastavit)
    - Click "Zastavit" during processing, verify returns to files-ready with files intact
    - _Requirements: 7.3, 27.5_

  - [ ]* 17.6 Write E2E test for Step 4 error flow
    - Trigger error via mock service, verify error state renders
    - Test "Zkusit znovu" returns to files-ready
    - Test mobile error accordions expand/collapse independently
    - _Requirements: 9.3, 10.3, 27.3, 27.5_

  - [ ]* 17.7 Write E2E test for Report navigation from Step 5
    - Click "Zobrazit report", verify navigation to `/report` with data
    - Click "Zpět na čištění", verify navigation back to `/` in idle state
    - _Requirements: 23.1, 23.3, 27.5_

  - [ ]* 17.8 Write E2E test for Reports page (desktop table + mobile cards)
    - Desktop: verify table headers, row data, filter buttons
    - Mobile: verify card layout, scrollable filters, fixed bottom CTA
    - _Requirements: 13.3, 13.4, 14.1, 14.2, 27.2_

  - [ ]* 17.9 Write E2E test for mobile hamburger menu on all pages
    - Open/close hamburger on main page, reports, and report detail
    - Verify language options, icon animation bars↔xmark
    - _Requirements: 3.1, 3.2, 3.3, 27.3_

  - [ ]* 17.10 Update existing E2E tests for design-aligned flows
    - Update selectors, text matchers, assertions for new markup
    - Ensure `bun run test:e2e` passes without failures
    - _Requirements: 27.1, 27.4_

- [ ] 18. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The client-side risk scanner (`src/lib/scanner/`) already exists from a prior spec — task 13 wires it to the new upload flow
- All text must go through Paraglide i18n (`tx()` helper) — no hardcoded strings in templates
- The "Možnosti" (Options) button must NOT appear anywhere in the UI

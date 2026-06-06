# Requirements Document

## Introduction

The MetaCleaner frontend app has drifted from the reference HTML mockups in `frontend/metacleaner-app/.design/`. This spec captures all changes required to realign the current SvelteKit implementation with the design mockups across all app states (Steps 1–5, Reports list, and Report detail), covering both desktop and mobile variants.

Steps 1–5 are **UI states on a single page** (`/`), not separate routes. The app operates as an SPA where only the relevant content section re-renders based on the current App_State — the page itself never navigates. Communication with the backend happens via REST API (currently mocked), and state transitions occur reactively without full-page reloads.

## Glossary

- **App**: The MetaCleaner SvelteKit 5 frontend application (SPA — single-page application)
- **Design_Mockup**: The reference HTML files located in `frontend/metacleaner-app/.design/`
- **Main_Page**: The single route (`/`) that hosts the entire cleaning workflow as an SPA. Steps 1–5 are UI states within this page, not separate routes. Only the relevant section of the page re-renders when state changes.
- **Step1_State**: The initial UI state before any file upload (no files in store)
- **Step2_State**: The UI state after files are uploaded, showing Risk Scanner analysis
- **Step3_State**: The UI state while files are being cleaned (processing active)
- **Step4_State**: The UI state when processing fails (error occurred)
- **Step5_State**: The UI state after cleaning finishes successfully
- **Reports_View**: The report history list page (route `/reports`)
- **Report_View**: The detailed single report page (route `/report`)
- **Desktop_Layout**: The layout rendered at viewport widths ≥1024px (lg breakpoint)
- **Mobile_Layout**: The layout rendered at viewport widths <1024px
- **NavBar**: The top navigation bar component present on all pages
- **Upload_Zone**: The drag-and-drop file upload area
- **Risk_Scanner**: The privacy risk analysis panel showing score ring, risk breakdowns, and before/after comparison
- **Status_Card**: The right-column card showing processing state/idle state
- **File_List**: The list of uploaded files with status indicators
- **App_State**: A reactive store value (`'idle' | 'files-ready' | 'processing' | 'error' | 'success'`) that determines which UI state (Step 1–5) is rendered on the Main_Page

## Requirements

### Requirement 1: Step 1 Desktop — Two-Column Layout with Status Card

**User Story:** As a user on desktop with no files uploaded, I want to see the upload zone on the left and a "Processing Status" idle card on the right, so that the layout matches the design.

#### Acceptance Criteria

1. WHILE no files are uploaded AND the viewport is Desktop_Layout, THE Main_Page SHALL display a two-column grid layout with proportions 55%/43%.
2. WHILE no files are uploaded AND the viewport is Desktop_Layout, THE Main_Page SHALL display a Status_Card in the right column showing an idle state with a shield icon, a "Čeká na soubory" badge, and text prompting the user to upload files.
3. WHEN files are uploaded, THE Main_Page SHALL transition in-place (without navigation) to the two-column layout with Upload_Zone and File_List on the left and the Risk_Scanner on the right.

### Requirement 2: Step 1 Desktop — Upload Zone Card Structure

**User Story:** As a user on desktop, I want the upload zone to match the design mockup's card structure, so that the UI is consistent with the visual design.

#### Acceptance Criteria

1. THE Upload_Zone card SHALL display a header row with "Nahrát soubory" title on the left and supported format badges (JPG, PNG, HEIC, MP4, MOV) on the right.
2. THE Upload_Zone drop zone SHALL display a file-arrow-up icon in a rounded circle, "Přetáhněte soubory sem" as primary text, "nebo klikněte pro výběr ze zařízení" as secondary text, and category pills (Fotografie, Videa, Max 500 MB / soubor).
3. THE Upload_Zone card SHALL contain a disabled "Spustit čištění" button (gray, cursor-not-allowed) at the bottom when no files are uploaded.
4. WHEN files are added, THE Upload_Zone SHALL shrink the drop zone to a compact "Přidat další soubory" version with a plus icon instead of the full upload prompt.
5. WHEN a file is being dragged over the Upload_Zone, THE drop zone SHALL visually highlight (e.g., brighter border color, subtle background tint) to indicate it is a valid drop target.

### Requirement 3: Step 1 Mobile — Hamburger Menu Navigation

**User Story:** As a mobile user, I want a single hamburger menu button in the navbar that contains language selection, settings, and logout, so that navigation is consolidated for small screens.

#### Acceptance Criteria

1. WHILE the viewport is Mobile_Layout, THE NavBar SHALL display a single hamburger menu button (bars icon) on the right side instead of separate language and user dropdown buttons.
2. WHEN the hamburger menu is opened, THE NavBar SHALL display a dropdown containing: user info section, language selection options (CZ, EN, DE, SK) with checkmarks, settings option, and logout option.
3. WHEN the hamburger icon is tapped, THE NavBar SHALL animate the icon to an X (xmark) indicating the menu is open.

### Requirement 4: Step 1 Mobile — Upload Zone and Status Card Layout

**User Story:** As a mobile user on the initial screen, I want a single-column layout with upload zone followed by a status card, matching the design mockup.

#### Acceptance Criteria

1. WHILE no files are uploaded AND the viewport is Mobile_Layout, THE Main_Page SHALL display the Upload_Zone card followed by the Status_Card in a single column.
2. THE Mobile_Layout Upload_Zone SHALL show "Klepněte pro výběr souborů" as primary text and "nebo přetáhněte soubory sem" as secondary text.
3. THE Mobile_Layout Upload_Zone action buttons SHALL stack vertically with the "Spustit čištění" button displayed (disabled when no files).

### Requirement 5: Step 2 Desktop — Two-Column Layout with File List and Risk Scanner

**User Story:** As a desktop user with files uploaded, I want to see the file list on the left and the Risk Scanner on the right in a two-column layout, matching the design.

#### Acceptance Criteria

1. WHILE files are uploaded AND the viewport is Desktop_Layout, THE Main_Page (Step2_State) SHALL display a two-column grid layout (55%/43%) with the Upload_Zone card (containing file list) on the left and the Risk_Scanner card on the right.
2. THE left column SHALL contain: the upload zone card with a compact "add more" drop zone, the file list showing all queued files with metadata field counts and risk indicators, and the "Spustit čištění" action button (enabled).
3. THE right column Risk_Scanner SHALL display: a "Risk Scanner" title with "Vysoké riziko" badge, the risk score ring (SVG circle), severity description with category chips, risk breakdown bars, before/after score comparison, and a CTA hint.
4. EACH file in the File_List SHALL display: a file type icon with appropriate color, file name (truncated), file size, metadata field count or GPS warning, file extension badge, and a remove button visible on hover.

### Requirement 6: Step 2 Mobile — Risk Banner and File List

**User Story:** As a mobile user with files uploaded, I want a collapsible risk banner above the file list and a fixed-bottom CTA bar, matching the mobile design.

#### Acceptance Criteria

1. WHILE files are uploaded AND the viewport is Mobile_Layout, THE Main_Page (Step2_State) SHALL display: a collapsible risk banner accordion, the upload zone card with file list, and a CTA hint card.
2. THE risk banner accordion SHALL display a collapsed header showing the risk score circle (SVG), "Risk Scanner" title, severity badge, and category chips; expanding reveals risk bars and before/after scores.
3. THE fixed bottom CTA bar SHALL display the "Spustit čištění" button.

### Requirement 7: Step 3 Desktop — Processing Two-Column Layout

**User Story:** As a desktop user during processing, I want to see file progress on the left and an animated processing visual on the right, matching the design.

#### Acceptance Criteria

1. WHILE processing is active AND the viewport is Desktop_Layout, THE Main_Page (Step3_State) SHALL display a "Probíhá čištění..." badge in the page header area.
2. THE left column SHALL display the files card with: a "Soubory ke zpracování" header with "Zpracovávám" spinning badge, an overall progress bar with percentage and time remaining, per-file status rows (completed with green check, in-progress with spinner and progress bar, waiting with clock icon and opacity), and a red "Zastavit" button.
3. WHEN the "Zastavit" button is clicked, THE App SHALL cancel the cleaning process and transition back to Step2_State (files-ready) with all files still in the list.
3. THE right column status card SHALL display: a "Stav zpracování" header with "Probíhá" spinning badge, an animated processing visual (pulsing ring, shield icon, spinning notch badge), current file label, live stats grid (3 columns: files count, fields removed, files completed), and a "Průběžný log" section with timestamped entries.

### Requirement 8: Step 3 Mobile — Processing Layout

**User Story:** As a mobile user during processing, I want a compact single-column processing view with status card and files card, matching the mobile design.

#### Acceptance Criteria

1. WHILE processing is active AND the viewport is Mobile_Layout, THE Main_Page (Step3_State) SHALL display a "Probíhá..." badge in the header row next to the title.
2. THE Mobile_Layout SHALL display: a status card with animated processing visual (shield icon with pulsing ring, spinning badge), current file label, live stats grid (3-column), followed by the files card with overall progress, per-file status rows, and action buttons.
3. THE Mobile_Layout SHALL include an activity log accordion (collapsed by default) with a chevron toggle showing timestamped processing entries.

### Requirement 9: Step 4 Desktop — Error Two-Column Layout

**User Story:** As a desktop user when an error occurs, I want to see the error details in a structured two-column layout with file statuses on the left and error diagnosis on the right.

#### Acceptance Criteria

1. WHILE an error has occurred AND the viewport is Desktop_Layout, THE Main_Page (Step4_State) SHALL display a "Chyba zpracování" badge in the header area.
2. THE Main_Page (Step4_State) SHALL display a full-width error banner with: a warning triangle icon, "Proces čištění selhal" title, error code badge, error description text, and a dismiss (X) button.
3. THE left column SHALL display: overall progress bar (red gradient, showing "Přerušeno"), per-file status rows (completed files with green check, failed file with red X icon and red border, skipped file with ban icon and reduced opacity), and action buttons (Zkusit znovu + Vymazat vše).
4. THE right column error state card SHALL display: error visual (pulsing ring, shaking triangle icon, red X badge), failed file name, error detail box with error code/time/file/phase grid, error type selector (radio-style list: Cleaning Process Failed, Connection Error, Timeout), and a log section.

### Requirement 10: Step 4 Mobile — Error Accordion Layout

**User Story:** As a mobile user when an error occurs, I want error details split into collapsible accordions for compact viewing on a small screen.

#### Acceptance Criteria

1. WHILE an error has occurred AND the viewport is Mobile_Layout, THE Main_Page (Step4_State) SHALL display: a "Chyba" badge in the header, a compact error banner, an error visual card, the files card, and separate accordion sections for error detail, error type, and error log.
2. THE mobile error visual card SHALL display: the pulsing ring with shaking triangle icon, failed file info, and overall progress bar (red, showing "Přerušeno").
3. EACH error accordion (Detail chyby, Typ chyby, Log chyby) SHALL be independently expandable/collapsible with chevron rotation animation.

### Requirement 11: Step 5 Desktop — Success Results Layout

**User Story:** As a desktop user when cleaning is complete, I want to see a success header with animation, summary stats, metadata overview, and file results in a full-width layout.

#### Acceptance Criteria

1. WHEN cleaning completes successfully AND the viewport is Desktop_Layout, THE Main_Page (Step5_State) SHALL display a success header with: an animated check icon (checkPop animation), "Čištění dokončeno!" title, metadata removal count in subtitle, "Nahrát nové soubory" button, and a "100% Úspěšně dokončeno" badge.
2. THE Main_Page (Step5_State) SHALL display 4 summary stat cards in a row: files processed, fields removed (green highlight), GPS locations removed (blue), and total time (orange icon).
3. THE Main_Page (Step5_State) SHALL display a metadata overview card with a two-column Before/After grid: "Před čištěním" (red border, warning icon, listing GPS/EXIF/XMP/Other with counts) and "Po čištění" (green border, shield icon, showing all items as "Odstraněno" with check marks).
4. THE Main_Page (Step5_State) SHALL display a file results card with: a 2-column grid of file result items (each showing icon, name, size, type badge, check indicator, and metadata type chips), and action buttons (Stáhnout vše ZIP + Zobrazit report).

### Requirement 12: Step 5 Mobile — Success Results Layout

**User Story:** As a mobile user when cleaning is complete, I want the success view optimized for mobile with an accordion metadata overview and fixed-bottom action buttons.

#### Acceptance Criteria

1. WHEN cleaning completes successfully AND the viewport is Mobile_Layout, THE Main_Page (Step5_State) SHALL display: a success header (smaller icon, "Čištění dokončeno!" title, 100% badge), summary stats in a 2×2 grid, a collapsible metadata overview accordion (open by default with Before/After tabs), and file results in a stacked single-column list.
2. THE Mobile_Layout metadata overview SHALL use tab buttons ("Před čištěním" / "Po čištění") to switch between before and after panels instead of a side-by-side grid.
3. THE Mobile_Layout SHALL display a fixed bottom CTA bar with: "Stáhnout vše (ZIP)" primary button, and a row of two secondary buttons ("Zobrazit report" + "Nahrát nové").

### Requirement 13: Reports List Desktop — Table Layout

**User Story:** As a desktop user on the reports page, I want a structured table view with filters, search, and column headers for easy report browsing.

#### Acceptance Criteria

1. THE Reports_View desktop layout SHALL display: a page header with history icon, "Historie reportů" title, subtitle with report count, and "Nové čištění" green button.
2. THE Reports_View SHALL display 4 summary stat cards in a row: total reports (blue), metadata fields removed (green), files processed (orange), GPS locations removed (red).
3. THE Reports_View SHALL display a filter/search bar card with: filter buttons (Vše, Úspěšné, Obsahovalo GPS, Fotografie, Video) and a search input.
4. THE reports table SHALL have column headers (ID, Datum, Soubory, Pole, Typy, Status, Akce) and rows with: report ID, date/time/duration, file count with type, fields removed count, metadata type badges (GPS/EXIF/XMP), status indicator (green dot + OK), and action buttons (view + download).

### Requirement 14: Reports List Mobile — Card Layout

**User Story:** As a mobile user on the reports page, I want report cards optimized for mobile with a fixed-bottom CTA for new cleaning.

#### Acceptance Criteria

1. THE Reports_View mobile layout SHALL display: a compact page header with history icon and "Nové" button, 2×2 stat grid, search input, horizontally scrollable filter buttons, and a card-based report list.
2. EACH report card SHALL show: date with report ID and status dot, time/duration/file count/types, metadata type badges with field count, and action buttons (view + download) on the right.
3. THE Reports_View mobile layout SHALL display a fixed bottom CTA "Nové čištění" button with gradient background fade.

### Requirement 15: Report Detail Desktop — Full Analytical Layout

**User Story:** As a desktop user on the report detail page, I want to see charts, per-file breakdowns, and detailed metadata tables.

#### Acceptance Criteria

1. THE Report_View desktop navbar SHALL display: the MetaCleaner logo, a "Zpět na výsledky" back button, and the user dropdown (without the language selector).
2. THE Report_View SHALL display: a report header with file-lines icon, title "Detailní report čištění", generation date/file count/field count, and action buttons (Stáhnout PDF + Tisknout).
3. THE Report_View SHALL display: a meta info bar (4 columns: ID, date, user, status), 4 summary stat cards (same style as Step 5), and a two-column chart section (metadata distribution chart with legend/bars on left, per-file breakdown on right).
4. THE Report_View SHALL display a "Detailní přehled souborů" section with: expandable accordion items per file (showing GPS/EXIF/XMP data tables with removed values shown as red strikethrough text), and a success summary bar per file.

### Requirement 16: Report Detail Mobile — Compact Analytical Layout

**User Story:** As a mobile user on the report detail page, I want the report information presented in a compact, scrollable single-column layout.

#### Acceptance Criteria

1. THE Report_View mobile navbar SHALL display: a back arrow button, the MetaCleaner logo, and a user avatar button (no username).
2. THE Report_View mobile layout SHALL display: a compact header with download button, 2×2 meta info grid, 2×2 stat cards, metadata distribution card, per-file breakdown card, and detailed file accordions.
3. EACH detailed file accordion SHALL show: a collapsed row with file icon, name, type badge, GPS indicator, check mark, and chevron; when expanded, stacked category cards (GPS/EXIF/XMP) with key-value pairs showing removed values.

### Requirement 17: Consistent Animations and Visual Effects

**User Story:** As a user, I want smooth animations and visual feedback across all states, so that the app feels polished and responsive.

#### Acceptance Criteria

1. THE App SHALL apply a `fadeInUp` entrance animation to cards and sections as they enter the viewport, with staggered delays (0.1s, 0.2s, 0.3s, 0.4s) for sequential elements.
2. THE App SHALL apply a `spin-slow` (2s linear infinite rotation) animation to all processing spinner icons (fa-circle-notch, fa-gear).
3. THE App SHALL apply a `pulse-ring` animation (scaling 1→1.08, opacity 0.4→0.8) to the ring behind the processing/error icon.
4. THE App SHALL apply a `checkPop` animation (scale 0→1.2→1) to the success check icon on Step 5.
5. THE App SHALL apply a `shake` animation (horizontal -4px/+4px oscillation) to the error triangle icon on Step 4.
6. THE App SHALL apply an animated dashed border (`border-dance`) to the drop zone that moves the dashes along the border continuously.

### Requirement 18: File Upload Validation

**User Story:** As a user, I want to be informed when I try to upload an invalid file (wrong type or too large), so that I understand why it wasn't added to the list.

#### Acceptance Criteria

1. WHEN a user attempts to upload a file with an unsupported type (not JPG, PNG, HEIC, MP4, or MOV), THE App SHALL display an error toast/notification with a message explaining the file type is not supported, and the file SHALL NOT be added to the File_List.
2. WHEN a user attempts to upload a file larger than 500 MB, THE App SHALL display an error toast/notification with a message explaining the file exceeds the size limit, and the file SHALL NOT be added to the File_List.
3. WHEN multiple files are uploaded and some are invalid, THE App SHALL add only the valid files to the File_List and display error notifications for each rejected file.

### Requirement 19: File Row Status Indicators and Removal

**User Story:** As a user, I want clear visual indicators for file processing states (waiting, in-progress, completed, failed, skipped) and the ability to remove files before processing, so that I can understand the status at a glance and manage my file list.

#### Acceptance Criteria

1. THE File_List SHALL display completed files with: a green-bordered row, green file icon background, green check circle badge, and "X polí odstraněno" text in green.
2. THE File_List SHALL display in-progress files with: a blue-bordered row, a per-file progress bar, a spinning circle-notch indicator, and percentage text in blue.
3. THE File_List SHALL display waiting files with: a gray-bordered row at 50% opacity, a clock icon, and "Čeká ve frontě" text in muted gray.
4. THE File_List SHALL display failed files with: a red-bordered row, red file icon background, red X circle badge, and "Zpracování selhalo" text in red.
5. THE File_List SHALL display skipped files with: a gray-bordered row at 50% opacity, a ban icon, and "Přeskočeno" text in muted gray.
6. EACH file row in Step2_State SHALL display a remove button (X icon) visible on hover (desktop) or always visible (mobile) that removes that specific file from the File_List when clicked.
7. WHEN the last file is removed from the File_List, THE App SHALL transition back to Step1_State (idle).

### Requirement 20: NavBar Consistency Across Pages

**User Story:** As a user, I want the navigation bar to be consistent across all pages with appropriate contextual actions.

#### Acceptance Criteria

1. THE NavBar on all pages (desktop) SHALL display: the MetaCleaner logo (shield icon + text), a language dropdown, and a user dropdown with avatar, name, chevron, and dropdown menu (email, settings, logout in red).
2. THE NavBar on Reports and Report pages (desktop) SHALL additionally display a back navigation button ("Zpět na výsledky" or "Zpět na čištění") between the logo and user dropdown.
3. THE NavBar on ALL mobile pages SHALL use a sticky top-0 positioning with border-bottom, the MetaCleaner logo (smaller h-9), and a hamburger menu button on the right side (same consolidated menu with user info, language options, settings, and logout).

### Requirement 21: Real File Upload with Mocked Server Communication

**User Story:** As a user, I want to upload real files from my device and see them displayed in the file list (not mock/hardcoded data), so that I can verify my actual files before cleaning starts.

#### Acceptance Criteria

1. WHEN a user selects or drags files into the Upload_Zone, THE App SHALL read the actual file metadata (name, size, type, extension) and display those real values in the File_List — no hardcoded/mock file entries SHALL be shown.
2. THE App SHALL store uploaded files in a client-side store (e.g., Svelte store or $state array) that persists across state transitions within the same session.
3. THE App SHALL generate file preview thumbnails (for images) or type icons (for videos) from the actual uploaded files.
4. WHEN the user clicks "Spustit čištění", THE App SHALL simulate server communication using a mock service layer that mimics the real API response patterns (job creation, progress updates via polling/WebSocket, completion/error responses) without making actual network requests.
5. THE mock service layer SHALL be implemented as a separate module (e.g., `src/lib/services/mockCleaningService.ts`) with the same interface that the real backend integration will use later, so that switching to real API calls requires only changing the service implementation.
6. THE File_List SHALL NOT contain any hardcoded/sample file entries — all displayed files SHALL come from user uploads or the mock service responses.
7. THE Reports and Report Detail pages SHALL also use mock data from the mock service layer, displaying realistic report entries generated from previous cleaning sessions.

### Requirement 22: Remove Unused Routes and Dead Code

**User Story:** As a developer, I want all obsolete route directories and unused code removed, so that the codebase stays clean and doesn't contain dead references.

#### Acceptance Criteria

1. THE route directories `/step2`, `/step3`, `/step4`, `/step5` SHALL be removed since all step logic now lives as state sections within the `/` route.
2. ALL components, stores, utilities, and imports that were exclusively used by the removed routes and are not reused by the new section-based architecture SHALL be deleted.
3. ALL hardcoded mock file data (previously displayed as sample files in the file list) SHALL be removed from the codebase.
4. THE App SHALL have no dead imports, unused variables, or orphaned files related to the removed routes after cleanup.

### Requirement 23: Report Navigation from Success State

**User Story:** As a user who completed cleaning, I want to view a detailed report of what was cleaned, so that I can verify the results.

#### Acceptance Criteria

1. WHEN the user clicks "Zobrazit report" on Step5_State, THE App SHALL navigate to the `/report` route showing a detailed report of the completed cleaning session.
2. THE report data SHALL be generated by the mock service layer based on the actual files that were processed and the simulated cleaning results.
3. WHEN the user clicks "Zpět na čištění" on the Report page, THE App SHALL navigate back to the Main_Page (`/`) which SHALL return to Step1_State (idle).

### Requirement 24: Functional Client-Side Risk Scanner

**User Story:** As a user who uploaded files, I want real-time privacy risk analysis performed entirely in my browser, so that I get immediate feedback on what metadata is at risk without my files leaving my device.

#### Acceptance Criteria

1. THE Risk_Scanner SHALL be implemented according to the specification in `.kiro/specs/client-side-risk-scanner/` — including the MetadataParser, RiskAnalyzer, and scannerStore modules.
2. WHEN files are added to the File_Queue, THE Risk_Scanner SHALL automatically extract metadata from each file using browser-local parsing (exifr for JPEG/HEIC/PNG/AVIF/TIFF/DNG, ExifReader for WebP/GIF, mediainfo.js WASM for video formats) without any network requests.
3. THE Risk_Scanner SHALL compute per-file risk scores (0–100) across four categories (GPS, device identity, personal data, timestamps) using the weighted scoring algorithm defined in the client-side-risk-scanner design.
4. THE Risk_Scanner SHALL compute an aggregated overall Risk_Score using the weighted maximum strategy (overall score = highest-risk file score) and classify severity as critical (75–100), high (50–74), medium (25–49), or low (0–24).
5. THE Risk_Scanner results SHALL be displayed in the RiskScannerCard (desktop) and MobileRiskBanner (mobile) showing: score ring, severity badge, category breakdown bars, before/after comparison, and per-file metadata field counts.
6. THE Risk_Scanner SHALL update results incrementally as files are added or removed, with UI updates within 200ms of re-computation completing.
7. THE mediainfo.js WASM module SHALL be lazy-loaded only when the first video file is detected, to keep initial page load fast for image-only users.
8. THE Metadata_Parser SHALL remain non-blocking — the UI SHALL stay interactive during scanning, with no main-thread block exceeding 50ms per file.

### Requirement 25: All User-Facing Text via i18n

**User Story:** As a developer, I want all user-facing text to come from Paraglide i18n message files (or REST API responses), so that no strings are hardcoded in component templates and the app is fully localizable.

#### Acceptance Criteria

1. ALL user-facing text strings rendered in component templates SHALL use Paraglide message functions (via `tx()` helper or `m.*()` imports) — no Czech or English strings SHALL be hardcoded directly in `.svelte` files.
2. ALL new text introduced by the design alignment (button labels, badges, headings, descriptions, error messages, status texts, tooltips) SHALL have corresponding keys added to `messages/en.json` and `messages/cs.json`.
3. Dynamic values (file names, counts, percentages, timestamps) SHALL use Paraglide message interpolation parameters rather than string concatenation in templates.
4. Error messages returned by the mock service layer SHALL be delivered as i18n message keys (or pre-localized strings from the service), not hardcoded text in the components that display them.
5. THE only text NOT required to go through i18n SHALL be: file names, file sizes, dates/times (formatted via Intl APIs), and dynamic numeric values.

### Requirement 26: Component Tests Alignment

**User Story:** As a developer, I want component tests (Vitest browser tests) updated to match the redesigned UI, so that tests validate the correct structure and behavior after the design alignment changes.

#### Acceptance Criteria

1. ALL existing component tests that reference changed UI elements (text content, CSS classes, DOM structure, aria attributes) SHALL be updated to match the new design-aligned markup.
2. WHEN a component's props or rendered output changes due to design alignment, THE corresponding component test SHALL verify the new expected output (e.g., new text labels, new element hierarchy, new conditional rendering logic).
3. THE component test suite SHALL pass without failures (`bun run test`) after all design alignment changes are applied.
4. NEW component tests SHALL be added for any newly created components or sections introduced by the design alignment (e.g., StatusCard idle state, hamburger menu, bottom sheets, error type selector).

### Requirement 27: E2E Tests Alignment

**User Story:** As a developer, I want end-to-end tests (Playwright) updated to reflect the redesigned UI flows, so that automated testing validates the correct user journeys after design changes.

#### Acceptance Criteria

1. ALL existing E2E tests that use selectors, text matchers, or assertions referencing changed UI elements SHALL be updated to match the new design-aligned pages.
2. E2E tests SHALL verify correct layout rendering for both Desktop_Layout (≥1024px viewport) and Mobile_Layout (<1024px viewport) where layout differs between breakpoints.
3. E2E tests SHALL verify navigation interactions specific to the new design: hamburger menu open/close on mobile, bottom sheet open/close, accordion expand/collapse, and back navigation buttons on reports pages.
4. THE E2E test suite SHALL pass without failures (`bun run test:e2e`) after all design alignment changes are applied.
5. NEW E2E test cases SHALL be added for any new user flows introduced by the design alignment (e.g., mobile hamburger menu navigation, options bottom sheet interaction, metadata overview tab switching on mobile).

# Implementation Plan: Frontend Code Quality Refactor

## Overview

This plan implements an internal code quality refactoring of the MetaCleaner SvelteKit frontend. It extracts duplicated utility functions into shared modules, resolves a type naming conflict, and fixes three discrete bugs (accessibility, reactivity, path resolution). All tasks use TypeScript and follow existing project conventions.

## Tasks

- [x] 1. Create shared utility modules
  - [x] 1.1 Create `src/lib/shared/utils/i18n.ts` with the shared `tx()` function
    - Export `tx(key: string, params?: Record<string, unknown>): string`
    - Read `locale.current` via `void locale.current;` for reactivity
    - Look up key in Paraglide messages module, return key unchanged if not found
    - Support both parameterized and parameterless message calls
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Create `src/lib/shared/utils/format.ts` with the shared `formatSize()` function
    - Export `formatSize(bytes: number): string`
    - Return `"0.0 KB"` for zero or negative values
    - Return KB format for values < 1,048,576, MB format otherwise
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.3 Create `src/lib/shared/utils/reportStyles.ts` with `tagStyle()` and `iconStyle()`
    - Export `tagStyle(tag: string): string` with brand-red (GPS), brand-orange (EXIF), brand-blue (XMP), neutral default
    - Export `iconStyle(color: string): string` with brand-green (green), brand-orange (orange), brand-blue default
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 1.4 Create `src/lib/shared/utils/riskStyles.ts` with risk severity utilities
    - Export `ringColorMap`, `severityBadgeClass`, `dotColorClass`, `severityTextClass`, `severityLabelKey` lookup objects keyed by `SeverityLevel`
    - Export `barSeverity(value: number): BarSeverity` function with threshold logic
    - Export `RingColor` and `BarSeverity` type aliases
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Write property tests for shared utilities
  - [x]* 2.1 Write property test for `tx()` key lookup and passthrough
    - **Property 1: tx() key lookup and passthrough**
    - **Validates: Requirements 1.1, 1.3, 1.4**
    - Test file: `src/lib/shared/utils/__tests__/i18n.test.ts`
    - Use `fc.string()` for keys, verify passthrough for unknown keys and invocation for known keys

  - [x]* 2.2 Write property test for `formatSize()` range correctness
    - **Property 2: formatSize range correctness**
    - **Validates: Requirements 2.2, 2.3, 2.4**
    - Test file: `src/lib/shared/utils/__tests__/format.test.ts`
    - Use `fc.double()` covering negative, zero, small, and large values

  - [x]* 2.3 Write property test for style functions
    - **Property 3: Style functions always return non-empty valid class strings**
    - **Validates: Requirements 3.3, 3.4, 3.6**
    - Test file: `src/lib/shared/utils/__tests__/reportStyles.test.ts`
    - Use `fc.string()` for arbitrary inputs, verify non-empty return and known-input mappings

  - [x]* 2.4 Write property test for `barSeverity()` threshold mapping
    - **Property 4: barSeverity threshold mapping**
    - **Validates: Requirements 4.2**
    - Test file: `src/lib/shared/utils/__tests__/riskStyles.test.ts`
    - Use `fc.integer({ min: 0, max: 100 })`, verify threshold boundaries

- [ ] 3. Checkpoint - Verify shared utilities
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Replace inline utilities across components
  - [ ] 4.1 Remove all inline `tx()` definitions from component files and import from `src/lib/shared/utils/i18n.ts`
    - Update all 21+ component files that declare a local `tx()` function
    - Add `import { tx } from '$lib/shared/utils/i18n'` to each file
    - Remove the local function declaration and any local imports of `locale`/`m` that are no longer needed
    - _Requirements: 1.5_

  - [ ] 4.2 Remove inline `formatSize()` from components and import from `src/lib/shared/utils/format.ts`
    - Update `FileListItemRisk.svelte`, `ProcessingFilesCard.svelte`, `FileResultsCard.svelte`
    - Add `import { formatSize } from '$lib/shared/utils/format'`
    - Remove local `formatSize` function declarations
    - _Requirements: 2.5_

  - [ ] 4.3 Remove inline `tagStyle()`/`iconStyle()` from components and import from `src/lib/shared/utils/reportStyles.ts`
    - Update `ReportTableRow.svelte` and `ReportCard.svelte`
    - Add `import { tagStyle, iconStyle } from '$lib/shared/utils/reportStyles'`
    - Remove local function declarations
    - _Requirements: 3.5, 3.6_

  - [ ] 4.4 Remove inline risk severity utilities from components and import from `src/lib/shared/utils/riskStyles.ts`
    - Update `RiskScannerCard.svelte` and `MobileRiskBanner.svelte`
    - Import `ringColorMap`, `severityBadgeClass`, `dotColorClass`, `severityTextClass`, `severityLabelKey`, `barSeverity`, `RingColor`, `BarSeverity`
    - Remove all local declarations of those mappings, types, and functions
    - _Requirements: 4.4_

- [ ] 5. Resolve MetadataField type naming conflict
  - [ ] 5.1 Rename `MetadataField` to `ReportMetadataField` in `src/lib/types/report.ts`
    - Rename the interface declaration
    - Update all internal references within `report.ts` (e.g., `FileMetadataSection` interface properties)
    - _Requirements: 5.1_

  - [ ] 5.2 Update all consuming files that import `MetadataField` from `report.ts` to use `ReportMetadataField`
    - Find and update all import statements referencing `MetadataField` from `src/lib/types/report.ts`
    - Update type annotations in consuming components
    - Verify `MetadataField` in `src/lib/scanner/types.ts` remains unchanged
    - _Requirements: 5.2, 5.3_

- [ ] 6. Checkpoint - Verify type rename and utility replacements
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Fix UserDropdown accessibility
  - [ ] 7.1 Add `onSettings` and `onLogout` callback props and onclick handlers to `UserDropdown.svelte`
    - Add `onSettings?: () => void` and `onLogout?: () => void` to the Props interface
    - Add `onclick={() => onSettings?.()}` to the Settings div element
    - Add `onclick={() => onLogout?.()}` to the Logout div element
    - Update `onkeydown` handlers to invoke callbacks directly instead of `e.currentTarget.click()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 7.2 Write unit tests for UserDropdown accessibility
    - Test file: `src/lib/shared/components/__tests__/UserDropdown.test.ts`
    - Test click invokes `onSettings`/`onLogout` callbacks
    - Test Enter keydown invokes callbacks
    - Test no-op when callbacks not provided
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

- [ ] 8. Fix appState store reactivity
  - [ ] 8.1 Change `_currentState` in `appState.svelte.ts` from `$derived` to `$derived.by()`
    - Replace `$derived((): AppState => { ... })` with `$derived.by((): AppState => { ... })`
    - Update all internal references from `_currentState()` to `_currentState` (in `isProcessing`, `hasFiles` derived values and `current` getter)
    - Preserve the auto-correction logic unchanged
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 8.2 Write unit tests for appState store reactivity
    - Test file: `src/lib/stores/__tests__/appState.test.ts`
    - Test auto-correction logic (idle + hasFiles → files-ready, files-ready + !hasFiles → idle)
    - Test `current`, `isProcessing`, `hasFiles` getter values per state
    - _Requirements: 7.3, 7.4_

- [ ] 9. Fix AuthNavbar path resolution
  - [ ] 9.1 Wrap `rightHref` with `resolve()` in `AuthNavbar.svelte`
    - Import `resolve` from `$app/paths` and `Pathname` from `$app/types`
    - Change `rightHref` prop type from `string` to `Pathname`
    - Set anchor `href` to `resolve(rightHref)` instead of bare `rightHref`
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10. Final checkpoint - Full verification
  - Run `bun run check` — must pass with zero TypeScript errors
  - Run `bun run lint` — must pass with no unused variable warnings
  - Grep audit: confirm no inline `tx()`, `formatSize()`, `tagStyle()`, `iconStyle()` remaining in component files
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 5.4, 8.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses `vitest` + `fast-check` for property-based testing (already in dev dependencies)
- All shared utilities go in `src/lib/shared/utils/` per existing project conventions

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["4.1", "4.2", "4.3", "4.4", "5.1"] },
    { "id": 3, "tasks": ["5.2", "7.1", "8.1", "9.1"] },
    { "id": 4, "tasks": ["7.2", "8.2"] }
  ]
}
```

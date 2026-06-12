# Requirements Document

## Introduction

This specification defines a code quality refactoring for the MetaCleaner SvelteKit frontend application. The goal is to eliminate duplicated utility functions, resolve naming conflicts, and fix accessibility and reactivity issues across the codebase. No user-facing behavior changes are intended — this is purely an internal quality improvement.

## Glossary

- **App**: The MetaCleaner SvelteKit frontend application located in `frontend/metacleaner-app/`
- **tx_Function**: The i18n translation helper that wraps Paraglide message lookups with reactive locale tracking
- **Shared_Utils**: Utility modules located in `src/lib/shared/utils/` that export reusable helper functions
- **Risk_Utils**: A shared utility module for risk severity display mappings (colors, badges, labels, thresholds)
- **Report_Utils**: A shared utility module for report tag and icon style mappings
- **Scanner_Types**: Type definitions in `src/lib/scanner/types.ts` for file scanning data structures
- **Report_Types**: Type definitions in `src/lib/types/report.ts` for report display data structures
- **UserDropdown_Component**: The `src/lib/shared/components/UserDropdown.svelte` component
- **AppState_Store**: The reactive store in `src/lib/stores/appState.svelte.ts`
- **AuthNavbar_Component**: The `src/routes/(auth)/components/AuthNavbar.svelte` component
- **resolve_Function**: SvelteKit's `resolve()` from `$app/paths` used for internal link resolution

## Requirements

### Requirement 1: Extract shared tx() translation helper

**User Story:** As a developer, I want a single shared `tx()` function, so that I do not have to copy-paste the i18n helper into every component file.

#### Acceptance Criteria

1. THE App SHALL provide a shared `tx()` function exported from `src/lib/shared/utils/i18n.ts` that accepts a message key (string) and an optional params argument (`Record<string, unknown>`) and returns the translated string corresponding to that key
2. WHEN the shared `tx()` function is called, THE tx_Function SHALL read `locale.current` (via `void locale.current;`) so that Svelte's reactivity system tracks it as a dependency and re-evaluates the translation when the locale changes
3. IF the provided message key does not match any known translation function in the messages module, THEN THE tx_Function SHALL return the original key string unchanged
4. THE shared `tx()` function SHALL support both parameterized messages (passing a `Record<string, unknown>` argument to the message function) and parameterless messages (invoking the message function with no arguments when params is omitted or empty)
5. WHEN the shared `tx()` function is adopted, THE App SHALL contain zero inline `tx()` definitions in component files — all components SHALL import `tx` from `src/lib/shared/utils/i18n.ts` instead of declaring a local copy

### Requirement 2: Extract shared formatSize() utility

**User Story:** As a developer, I want a single `formatSize()` function in shared utils, so that file size formatting logic is not duplicated across components.

#### Acceptance Criteria

1. THE Shared_Utils SHALL export a `formatSize(bytes: number): string` function from `src/lib/shared/utils/format.ts`
2. WHEN bytes is less than 1,048,576, THE `formatSize` function SHALL return the size formatted as `"{value} KB"` with one decimal place (e.g. `"512.3 KB"`)
3. WHEN bytes is 1,048,576 or greater, THE `formatSize` function SHALL return the size formatted as `"{value} MB"` with one decimal place (e.g. `"2.4 MB"`)
4. WHEN bytes is zero or negative, THE `formatSize` function SHALL return `"0.0 KB"`
5. WHEN the shared `formatSize()` is adopted, THE App SHALL remove the inline `formatSize()` definitions from `FileListItemRisk.svelte`, `ProcessingFilesCard.svelte`, and `FileResultsCard.svelte` and import the shared version instead

### Requirement 3: Extract shared report style utilities

**User Story:** As a developer, I want shared `tagStyle()` and `iconStyle()` functions, so that the tag-color-to-CSS-class mapping is defined once and reused across report components.

#### Acceptance Criteria

1. THE Report_Utils SHALL export a `tagStyle(tag: string): string` function from `src/lib/shared/utils/reportStyles.ts`
2. THE Report_Utils SHALL export an `iconStyle(color: string): string` function from `src/lib/shared/utils/reportStyles.ts`
3. WHEN the `tagStyle` function receives "GPS", THE Report_Utils SHALL return background, border, and text Tailwind classes using the brand-red color token; WHEN it receives "EXIF", classes using the brand-orange token; WHEN it receives "XMP", classes using the brand-blue token; and WHEN it receives any other string, a neutral background class using navy-lighter and muted text
4. WHEN the `iconStyle` function receives "green", THE Report_Utils SHALL return background, border, and text Tailwind classes using the brand-green color token; WHEN it receives "orange", classes using the brand-orange token; and WHEN it receives any other string, classes using the brand-blue token as the default
5. WHEN the shared `tagStyle` and `iconStyle` functions are exported from `reportStyles.ts`, THE App SHALL import them in `ReportTableRow.svelte` and `ReportCard.svelte` and remove the inline `tagStyle()` and `iconStyle()` function definitions from those components
6. WHEN a report component calls `tagStyle` or `iconStyle` with any previously supported argument, THE Report_Utils SHALL return the same class string that the former inline implementation returned in that component

### Requirement 4: Extract shared risk severity utilities

**User Story:** As a developer, I want a single source of truth for risk severity display mappings, so that `RiskScannerCard.svelte` and `MobileRiskBanner.svelte` do not duplicate color maps and threshold logic.

#### Acceptance Criteria

1. THE Risk_Utils SHALL export `ringColorMap`, `severityBadgeClass`, `dotColorClass`, `severityTextClass`, and `severityLabelKey` lookup objects from `src/lib/shared/utils/riskStyles.ts`, each keyed by `SeverityLevel` and returning the corresponding display string
2. THE Risk_Utils SHALL export a `barSeverity(value: number): BarSeverity` function that accepts an integer in the range 0–100 and returns a severity level (critical when value ≥ 75, high when value ≥ 50, medium when value ≥ 25, low when value < 25)
3. THE Risk_Utils SHALL export the `RingColor` type alias with members `'red' | 'orange' | 'green' | 'blue'` and the `BarSeverity` type alias with members `'critical' | 'high' | 'medium' | 'low'`
4. WHEN the shared risk utilities are adopted, THE App SHALL import `ringColorMap`, `severityBadgeClass`, `dotColorClass`, `severityTextClass`, `severityLabelKey`, `barSeverity`, `RingColor`, and `BarSeverity` from `riskStyles.ts` in both `RiskScannerCard.svelte` and `MobileRiskBanner.svelte`, and remove all local declarations of those same mappings, types, and functions

### Requirement 5: Resolve MetadataField type naming conflict

**User Story:** As a developer, I want each interface to have a unique, descriptive name, so that two unrelated types with different shapes are not both called `MetadataField`.

#### Acceptance Criteria

1. THE Report_Types SHALL rename the `MetadataField` interface (with shape `{ label, value, moreCount? }`) in `src/lib/types/report.ts` to `ReportMetadataField`, and SHALL update all internal references to the renamed type within the same file (including the `FileMetadataSection` interface properties)
2. WHEN `ReportMetadataField` is renamed, THE App SHALL update all import statements and type references in consuming files that previously used `MetadataField` from `src/lib/types/report.ts` to use `ReportMetadataField`
3. THE Scanner_Types SHALL retain the existing `MetadataField` interface name (with shape `{ key, value, category }`) in `src/lib/scanner/types.ts` without changes
4. WHEN the rename is complete, THE App SHALL pass TypeScript compilation (`bun run check`) with zero type errors related to `MetadataField` or `ReportMetadataField`

### Requirement 6: Fix UserDropdown accessibility — add onclick handlers

**User Story:** As a user navigating with a mouse, I want the Settings and Logout dropdown items to respond to click events, so that I can activate them without using a keyboard.

#### Acceptance Criteria

1. WHEN the Settings item in the UserDropdown_Component is clicked, THE UserDropdown_Component SHALL invoke the `onSettings` callback prop
2. WHEN the Logout item in the UserDropdown_Component is clicked, THE UserDropdown_Component SHALL invoke the `onLogout` callback prop
3. WHEN the Settings item in the UserDropdown_Component receives an `Enter` keydown event, THE UserDropdown_Component SHALL invoke the `onSettings` callback prop
4. WHEN the Logout item in the UserDropdown_Component receives an `Enter` keydown event, THE UserDropdown_Component SHALL invoke the `onLogout` callback prop
5. THE UserDropdown_Component SHALL expose optional `onSettings` and `onLogout` callback props to allow parent components to define the activation behavior
6. IF the `onSettings` or `onLogout` callback prop is not provided, THEN THE UserDropdown_Component SHALL perform no action when the respective item is activated

### Requirement 7: Fix appState store — use $derived.by() for computed value

**User Story:** As a developer, I want the `_currentState` derived value to return the `AppState` value directly, so that consumers do not have to invoke it as a function.

#### Acceptance Criteria

1. THE AppState_Store SHALL use `$derived.by(() => { ... })` for `_currentState` so it returns an `AppState` value directly instead of a function
2. WHEN `_currentState` is changed to use `$derived.by()`, THE AppState_Store SHALL update all internal references that previously called `_currentState()` to use `_currentState` without parentheses (specifically `isProcessing` and `hasFiles` derived values and the `current` getter)
3. THE AppState_Store SHALL maintain the same external API — the `current`, `isProcessing`, and `hasFiles` getters SHALL continue to return the same values as before for all consumers
4. THE AppState_Store SHALL preserve the auto-correction logic: when `_explicitState` is `'idle'` and `scannerStore.hasFiles` is true, `_currentState` returns `'files-ready'`; when `_explicitState` is `'files-ready'` and `scannerStore.hasFiles` is false, `_currentState` returns `'idle'`

### Requirement 8: Fix AuthNavbar — wrap href with resolve()

**User Story:** As a developer, I want internal links in the AuthNavbar to go through SvelteKit's `resolve()`, so that base path configuration is respected and links work correctly in all deployment contexts.

#### Acceptance Criteria

1. WHEN `rightHref` is provided and the right-side link is rendered, THE AuthNavbar_Component SHALL set the anchor element's `href` attribute to the value returned by `resolve(rightHref)` from `$app/paths`
2. THE AuthNavbar_Component SHALL import `resolve` from `$app/paths` and type the `rightHref` prop as `Pathname` from `$app/types`
3. IF `rightHref` is not provided or `rightLabel` is not provided, THEN THE AuthNavbar_Component SHALL not render the right-side anchor element and its surrounding container (existing behavior preserved)
4. WHEN the application base path is configured to a non-root value, THE AuthNavbar_Component SHALL render the anchor `href` with the base path prepended to the `rightHref` value

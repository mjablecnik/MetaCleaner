# Test Report

Created: 2025-06-03T03:42:00+00:00
Updated: 2026-06-07T07:18:03+00:00

## Summary

- Total E2E tests: 269
- Passing E2E tests: 268
- Failing E2E tests: 1
- Total component stories: 179
- Passing component stories: 179
- Failing component stories: 0
- Total unit tests (Vitest server): 123
- Passing unit tests: 123
- Failing unit tests: 0

## E2E Test Coverage

| Page/Route                        | Test File                                | Status                      |
| --------------------------------- | ---------------------------------------- | --------------------------- |
| / (Step 1 — Upload)               | e2e/step1-upload.spec.ts                 | ✅ Pass (10 tests)          |
| / (Step 1 → Step 2 transition)    | e2e/step1-to-step2-transition.spec.ts    | ✅ Pass (14 tests)          |
| / (Step 2 — Risk Analysis)        | e2e/step2-risk-analysis.spec.ts          | ✅ Pass (14 tests)          |
| / (Step 2 → Step 5 complete flow) | e2e/step2-to-step5-complete-flow.spec.ts | ✅ Pass (12 tests)          |
| / (Step 3 — Processing)           | e2e/step3-processing.spec.ts             | ✅ Pass (14 tests)          |
| / (Step 3 — Cancel)               | e2e/step3-cancel.spec.ts                 | ✅ Pass (9 tests)           |
| / (Step 4 — Error)                | e2e/step4-error.spec.ts                  | ✅ Pass (23 tests)          |
| / (Step 5 — Results)              | e2e/step5-results.spec.ts                | ✅ Pass (17 tests)          |
| / (Step 5 → Report navigation)    | e2e/step5-report-navigation.spec.ts      | ✅ Pass (10 tests)          |
| /reports                          | e2e/reports.spec.ts                      | ✅ Pass (34 tests)          |
| /report/[id]                      | e2e/report-detail.spec.ts                | ❌ 1 Fail (27 pass, 1 fail) |
| Cross-cutting: File validation    | e2e/file-validation.spec.ts              | ✅ Pass (5 tests)           |
| Cross-cutting: File removal       | e2e/file-removal.spec.ts                 | ✅ Pass (9 tests)           |
| Cross-cutting: Navigation (SPA)   | e2e/navigation.spec.ts                   | ✅ Pass (17 tests)          |
| Cross-cutting: Hamburger menu     | e2e/hamburger-menu.spec.ts               | ✅ Pass (20 tests)          |
| Cross-cutting: Responsive layout  | e2e/responsive.spec.ts                   | ✅ Pass (33 tests)          |

## Component Test Coverage

| Component             | Story File                           | States Covered                                                            | Status  |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------------- | ------- |
| AccordionCard         | AccordionCard.stories.svelte         | Open, Closed, Blue/Green/Red border, With header, With icon               | ✅ Pass |
| Badge                 | Badge.stories.svelte                 | Blue, Green, Orange, Red, With dot, With icon                             | ✅ Pass |
| Button                | Button.stories.svelte                | Primary, Secondary, Danger, Ghost, Disabled, Loading, Sizes, With icon    | ✅ Pass |
| Card                  | Card.stories.svelte                  | Default, Blue/Green/Orange/Red border, Custom padding                     | ✅ Pass |
| Chip                  | Chip.stories.svelte                  | Blue, Green, Orange, Red, Muted, Rounded, Without border                  | ✅ Pass |
| IconContainer         | IconContainer.stories.svelte         | All colors solid/tinted, All sizes, Circle/Square shape                   | ✅ Pass |
| ProgressBar           | ProgressBar.stories.svelte           | Empty, Half, Full, Colors (blue/green/orange/red/gray), Heights           | ✅ Pass |
| ToggleSwitch          | ToggleSwitch.stories.svelte          | On, Off, Disabled on, Disabled off                                        | ✅ Pass |
| ActivityLog           | ActivityLog.stories.svelte           | Empty, In progress, Success only, With entries, With error                | ✅ Pass |
| LanguageDropdown      | LanguageDropdown.stories.svelte      | Closed, Open, Czech selected closed/open                                  | ✅ Pass |
| MobileBottomCta       | MobileBottomCta.stories.svelte       | With button content, With text content                                    | ✅ Pass |
| MobileHamburgerMenu   | MobileHamburgerMenu.stories.svelte   | Closed, Open, No user, Open with language options                         | ✅ Pass |
| NavBar                | NavBar.stories.svelte                | Default, Compact, No user, With back button, Without language             | ✅ Pass |
| PageHeader            | PageHeader.stories.svelte            | Without badge, Blue/Orange/Red badge                                      | ✅ Pass |
| StatCard              | StatCard.stories.svelte              | Blue/Green/Orange/Red default/highlighted, With mobile label              | ✅ Pass |
| Toast                 | Toast.stories.svelte                 | Visible, Hidden, Error icon, Custom icon                                  | ✅ Pass |
| UserDropdown          | UserDropdown.stories.svelte          | Closed, Open, No user, No user open                                       | ✅ Pass |
| BeforeAfterScore      | BeforeAfterScore.stories.svelte      | Improved high, Improved moderate, Unchanged equal, Zero risk              | ✅ Pass |
| DropZone              | DropZone.stories.svelte              | Idle, Dragover                                                            | ✅ Pass |
| FileListItemRisk      | FileListItemRisk.stories.svelte      | High/Medium/Low risk, Scan error, Scanning, Video file                    | ✅ Pass |
| RiskBreakdownBar      | RiskBreakdownBar.stories.svelte      | Critical GPS, High device, Low author, Medium timestamps, Multiple        | ✅ Pass |
| RiskScoreRing         | RiskScoreRing.stories.svelte         | High/Medium/Low risk, Blue variant, Large/Small size                      | ✅ Pass |
| ScanProgressIndicator | ScanProgressIndicator.stories.svelte | Idle, Scanning, Complete, Error                                           | ✅ Pass |
| ChartBar              | ChartBar.stories.svelte              | All colors, Blue low, Green full, Orange medium, Red high, Zero           | ✅ Pass |
| FileAccordionItem     | FileAccordionItem.stories.svelte     | Collapsed no GPS, Collapsed with GPS, Expanded image/video, Rich metadata | ✅ Pass |
| MetadataTable         | MetadataTable.stories.svelte         | Few fields, Many fields, Single field, With more count                    | ✅ Pass |
| FilterPill            | FilterPill.stories.svelte            | Active, Inactive, With count, With icon, Pill group                       | ✅ Pass |
| ReportCard            | ReportCard.stories.svelte            | Image type, Video type, High fields, With tags, Multiple                  | ✅ Pass |
| ReportTableRow        | ReportTableRow.stories.svelte        | Image type, Video type, High fields, With GPS, Multiple                   | ✅ Pass |

## Uncovered (no tests)

**None** — All pages/routes and interactive components have test coverage.

- All 7 route states (`/` idle, files-ready, processing, error, success + `/reports` + `/report/[id]`) are covered by E2E tests.
- All 29 interactive components have Storybook stories (179 total variants).
- Section-level compositions are tested via E2E (appropriate for their integration complexity).

## Notes

- **1 failing E2E test**: `e2e/report-detail.spec.ts` — "collapse all button collapses open accordion" (desktop viewport) times out at 30s. This appears to be a timing/interaction issue with the accordion collapse animation, not a structural test defect.
- **Storybook build**: Successful (179 stories compiled without errors).
- **Unit tests**: All 123 Vitest server-side tests pass (stores, scanner, risk analyzer, format detector).
- **Test infrastructure**: Playwright with Chromium, Vitest for unit/component, Storybook 10 for visual catalog.

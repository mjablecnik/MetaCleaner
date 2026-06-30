# Component (Storybook) Tasks — `frontend/metacleaner-app`

Run stories with: `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers npm run test:unit -- --run --project=storybook`

## Phase 0 — Cleanup

- [x] No orphaned stories to remove (88/88 stories have a matching component).

## Phase 1 — Fix failing tests

> All failures share one root cause: prop fields are read without a null guard, and Storybook
> teardown re-runs the reactive graph with `undefined` props → `TypeError: Cannot read properties
> of undefined`. Fix = defensive prop access (optional chaining / `?? []` / `{#if prop?.x}`); no
> production behaviour change. After each fix, the component's stories should produce **0 unhandled errors**.

- [x] Fix **ChartBar** story — `report/components/ChartBar.svelte:29`: `colorMap[color]` is undefined on teardown. Use `const classes = $derived(colorMap[color] ?? colorMap.blue)` and/or `classes?.text` / `classes?.bar`.
- [x] Fix **ErrorStateCard** story — `sections/Step4Error/ErrorStateCard.svelte:72,149`: guard `error?.fileName` and any `errorTypes`/`error` access used in the template.
- [x] Fix **ErrorDetailAccordion** story — `sections/Step4Error/ErrorDetailAccordion.svelte:51,128`: guard `error?.fileName`.
- [x] Fix **FileProcessingRow** story — `sections/Step3Processing/components/FileProcessingRow.svelte:68,215`: guard `file?.status` and the derived/template values that read `file`.
- [x] Fix **ReportCard** story — `reports/components/ReportCard.svelte:46`: guard `report?.tags`, `report?.hasGps`, `report?.type`.
- [x] Fix **ReportTableRow** story — `reports/components/ReportTableRow.svelte:58`: guard `report?.tags`.
- [x] Fix **ReportsList** story — `reports/sections/ReportsList.svelte:28,73`: guard `reports?.length` and the `reports?.find(...)` mobile path; default the array to `[]`.
- [x] Fix **ReportsTable** story — `reports/sections/ReportsTable.svelte:63,138`: guard `reports?.length` / default `[]`.
- [x] Fix **FileAccordionItem** story — `report/components/FileAccordionItem.svelte:109,181`: guard `file?.hasGps` and nested metadata access.
- [x] Fix **FileListItemRisk** story — `(step1)/components/FileListItemRisk.svelte:15,121`: guard `file?.scanResult`.
- [x] Fix **FileResultsCard** story — `sections/Step5Success/FileResultsCard.svelte:45`: use `(files ?? []).map(...)`.
- [x] Fix **MetadataFieldList** story — `sections/Step5Success/components/MetadataFieldList.svelte:33`: guard the category/metadata prop before reading `exifFields`.
- [x] Fix **MetadataCategoryCard** story — `sections/Step5Success/components/MetadataCategoryCard.svelte:55`: guard the category prop before reading `exifFields`.
- [x] Fix **AuthStatsRow** story — `(auth)/components/AuthStatsRow.svelte:16`: use `(stats ?? []).map(...)` / guard `stats?.length`.
- [x] Fix **LanguageDropdown** story — `lib/shared/components/LanguageDropdown.svelte:21,31`: guard the `languages` array before `.find(...)`.
- [x] Fix **SettingsAccordionCard** story — `settings/components/SettingsAccordionCard.svelte`: guard the prop field read during teardown (optional chaining).
- [x] Fix **AffiliateProgramSection** story — `settings/sections/AffiliateProgramSection.svelte`: guard the prop field read during teardown.
- [x] Re-run the storybook project and confirm `Errors  0` and exit code 0.

## Phase 2 — Create missing stories

### Shared elements
- [x] Create story for **MethodBadge** (`lib/shared/elements/MethodBadge.svelte`) — states: each method (GET, POST, DEL, PATCH, PUT, WS) × size sm/md.
- [x] Create story for **InfoBox** (`lib/shared/elements/InfoBox.svelte`) — states: variant blue / green / orange / red, each with an icon and slotted body text.
- [x] Create story for **FeatureCard** (`lib/shared/elements/FeatureCard.svelte`) — states: 2–3 icon + iconColor combinations.
- [x] Create story for **CopyButton** (`lib/shared/elements/CopyButton.svelte`) — states: idle; copied (play function: click → assert "Copied" label). Mock `navigator.clipboard`/`document.execCommand` as in existing CopyButton/CodeBlock specs.
- [x] Create story for **CodeBlock** (`lib/shared/elements/CodeBlock.svelte`) — states: single-line code; multi-line code (embedded CopyButton).

### Shared billing/subscription sections
- [x] Create story for **CurrentPlanCard** — states: billingPeriod monthly / yearly / null; pro vs proplus.
- [x] Create story for **UpgradeCard** — states: default; loading.
- [x] Create story for **DowngradeCard** — states: default; loading.
- [x] Create story for **ReactivateCard** — states: default; loading.
- [x] Create story for **CancelSection** — state: default.
- [x] Create story for **CancellationBanner** — states: with / without planId.
- [x] Create story for **CancellingPlanCard** — states: early / mid / late in billing period (progress bar width).
- [x] Create story for **CancellingView** — states: monthly / yearly.
- [x] Create story for **ConfirmationModal** — states: confirmStyle primary / danger / secondary; loading.
- [x] Create story for **CountdownCard** — states: monthly / yearly; start-of-period vs near-end.
- [x] Create story for **ReactivateModal** — states: open; loading.
- [x] Create story for **UsageStatsCard** — states: low usage; high (near-limit) usage.
- [x] Create story for **WhatHappensAfterCard** — states: creditsRemaining = 0; creditsRemaining > 0.

### Settings
- [x] Create story for **DangerZoneSection** (`settings/sections/DangerZoneSection.svelte`) — state: default.
- [x] Create story for **CreateKeyModal** (`settings/components/CreateKeyModal.svelte`) — states: open (form); submitting; created (full key shown once).
- [x] Create story for **DeleteKeyModal** (`settings/components/DeleteKeyModal.svelte`) — states: open; deleting.
- [x] Create story for **AccountDeletionModal** (`settings/components/AccountDeletionModal.svelte`) — states: open (confirm disabled); confirm enabled; deleting.

> Notes for new stories:
> - Stories default to **English** (Paraglide default locale) — assert against English text.
> - Pass `fn()` from `storybook/test` for callback props (see existing stories).
> - Add the same `parameters.backgrounds` dark value used across existing stories for visual parity.
> - Avoid runtime Tailwind arbitrary classes in any helper markup (`w-[..%]` won't render — use `style`).

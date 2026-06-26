# Implementation Plan: Subscription Management — Ending Subscription State

## Overview

This plan implements the "ending subscription" intermediate state for the MetaCleaner app. It covers fixing the billing store logic, adding a backend reactivation endpoint, extending the billing client, adding i18n keys, building new UI components, and integrating the cancelling view into the pricing page.

## Tasks

- [x] 1. Fix billing store and add `isCancellingPlan` derived property
  - [x] 1.1 Add `isCancellingPlan` derived property and fix `isFreeUser` logic in `billingStore.svelte.ts`
    - Add `const isCancellingPlan = $derived(planStatus === 'cancelling');`
    - Fix `isFreeUser` to NOT include `'cancelling'` status (currently it would match via `planStatus === 'cancelled'` fallback — ensure `'cancelling'` is explicitly excluded)
    - Expose `isCancellingPlan` via the store's return object as a getter
    - Verify `isPaidPlan` remains `false` for `'cancelling'` (it already is since it only matches `'active'`/`'trialing'`)
    - Verify `monthlyAllowance` remains at the paid level for `'cancelling'` + `'pro'`/`'proplus'` planId (already works via PLAN_CONFIG lookup)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Fix `isCancelledWithFutureAccess` in pricing page to remove old `'cancelled'` status check
    - In `frontend/metacleaner-app/src/routes/pricing/+page.svelte`, remove the `isCancelledWithFutureAccess` derived variable
    - Remove the cancelled-with-future-access notice banner that uses it
    - Update `showManagementUI` to only check `billingStore.isPaidPlan` (no longer needs `isCancelledWithFutureAccess`)
    - _Requirements: 2.1_

- [x] 2. Implement backend reactivation endpoint
  - [x] 2.1 Add `HandleReactivateSubscription` handler in `billing_handlers.go`
    - Add `ErrNoCancellingSubscription = "NO_CANCELLING_SUBSCRIPTION"` error code constant
    - Add `ReactivateResponse` struct with `PlanID`, `Status`, `CurrentPeriodEnd` fields
    - Implement `HandleReactivateSubscription(cfg Config, db *SupabaseClient) http.HandlerFunc`
    - Authenticate user via `UserIDFromContext`
    - Fetch subscription from DB, validate status is `'cancelling'`
    - Return HTTP 400 with `NO_CANCELLING_SUBSCRIPTION` if not cancelling
    - Call Stripe `subscription.Update` with `CancelAtPeriodEnd: false`
    - On Stripe failure, return HTTP 502 with `BILLING_STRIPE_ERROR` without modifying DB
    - On success, update DB subscription status to `'active'`
    - Return 200 with `ReactivateResponse` containing plan_id, status "active", and current_period_end
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 2.2 Register reactivation route in `router.go`
    - Add `mux.Handle("POST /api/billing/reactivate", rateLimited(HandleReactivateSubscription(cfg, db)))` in the billing routes section
    - _Requirements: 10.1_

- [x] 3. Checkpoint — Ensure backend compiles
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Extend frontend billing client and types
  - [x] 4.1 Add `ReactivateResponse` type in `billing.ts`
    - Add `ReactivateResponse` interface with `plan_id: string`, `status: string`, `current_period_end: string`
    - _Requirements: 11.2_

  - [x] 4.2 Add `reactivateSubscription()` method in `billingClient.ts`
    - Add async method that sends POST to `/api/billing/reactivate` with auth header
    - Parse error responses and throw with server's error message
    - Return typed `ReactivateResponse` on success
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 5. Add i18n translation keys
  - [x] 5.1 Add English translation keys to `messages/en.json`
    - Add keys for: cancellation banner, page header badge, countdown labels, cancelling plan card labels, reactivate card text, reactivate modal content, usage stats labels, "what happens after" items
    - Key prefix: `subscription.cancelling.*`
    - _Requirements: 12.1, 12.2_

  - [x] 5.2 Add Czech translation keys to `messages/cs.json`
    - Add matching Czech translations for all keys added in 5.1
    - Use the design mockup text as reference for Czech strings
    - _Requirements: 12.1, 12.2_

- [ ] 6. Implement new UI components
  - [x] 6.0 Add missing CSS tokens to `layout.css`
    - Add `--shadow-glow-orange: 0 0 20px rgba(249, 115, 22, 0.15);` to the shadows section in `src/routes/layout.css`
    - Add a `.stripe-bg` utility class (either in `layout.css` or as a component-scoped style): `background-image: repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(249, 115, 22, 0.04) 6px, rgba(249, 115, 22, 0.04) 12px);`
    - Add a `.progress-bar-orange` utility class: `background: linear-gradient(90deg, #f97316, #fb923c); border-radius: 999px;`
    - These are required by the design mockups and do not exist in the current theme
    - _Requirements: 4.1, 5.2_

  - [x] 6.1 Create `CancellationBanner.svelte`
    - Create `frontend/metacleaner-app/src/lib/shared/sections/CancellationBanner.svelte`
    - Props: `periodEndDate: string`, `onReactivate: () => void`
    - Orange border, stripe-bg background, clock icon, "Subscription was cancelled" title, access end date
    - Desktop: includes a "Downgrade na Free: {date}" info chip (with calendar-xmark icon) next to the green "Reactivate" button
    - Desktop: inline green "Reactivate" button; Mobile: full-width green button below text
    - Use `tx()` for all text
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.2 Create `CancellingPlanCard.svelte`
    - Create `frontend/metacleaner-app/src/lib/shared/sections/CancellingPlanCard.svelte`
    - Props: `planId, price, monthlyAllowance, creditsUsed, creditsRemaining, periodEndDate, features`
    - Orange border with "Expiring plan" badge, plan name with "Cancelled" tag, price crossed out
    - Credits progress bar with expiration note
    - Transition timeline with three nodes: Today (green), downgrade date (orange), Free plan (grey)
    - Feature list with green check icons
    - Use `tx()` for all text
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 6.3 Create `CountdownCard.svelte`
    - Create `frontend/metacleaner-app/src/lib/shared/sections/CountdownCard.svelte`
    - Props: `periodEndDate: string`
    - Display remaining days, hours, minutes (computed client-side with `setInterval` every 60s)
    - Progress bar showing elapsed proportion
    - Display exact access end date below progress bar
    - When countdown reaches zero, show 0 for all units
    - Cleanup interval on unmount
    - Use `tx()` for all text
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.4 Create `ReactivateCard.svelte`
    - Create `frontend/metacleaner-app/src/lib/shared/sections/ReactivateCard.svelte`
    - Props: `planId, price, billingPeriod, periodEndDate, onReactivate: () => void`
    - Green border, plan price, benefits list (immediate reactivation, credits preserved, next payment on original date)
    - Full-width green "Reactivate" button with right-arrow
    - Use `tx()` for all text
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 6.5 Create `WhatHappensAfterCard.svelte`
    - Create `frontend/metacleaner-app/src/lib/shared/sections/WhatHappensAfterCard.svelte`
    - Props: `periodEndDate: string`, `creditsRemaining: number`
    - Title "What happens after {date}?" with lost items (red X) and retained items (green check)
    - Desktop: grid layout; Mobile: collapsible accordion
    - Use `tx()` for all text
    - _Requirements: 9.1, 9.2_

  - [ ] 6.6 Create `ReactivateModal.svelte`
    - Create `frontend/metacleaner-app/src/lib/shared/sections/ReactivateModal.svelte`
    - Props: `planId, price, billingPeriod, periodEndDate, onConfirm, onCancel, isLoading, error`
    - Display plan name/price, "€0 charge today", next payment date
    - Green info box: "Your plan will be immediately reactivated with no interruption"
    - Confirm button with loading indicator when request in progress
    - Disable modal interactions while loading
    - Display inline error if reactivation fails (modal stays open)
    - Use `tx()` for all text
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7. Create `CancellingView` wrapper component
  - [ ] 7.1 Create `CancellingView.svelte` orchestrating all cancelling sections
    - Create `frontend/metacleaner-app/src/lib/shared/sections/CancellingView.svelte`
    - Props: subscription data, billing store values, locale
    - Compose: CancellationBanner, page header with orange crown + badge, two-column grid
    - Left column: CancellingPlanCard, WhatHappensAfterCard
    - Right column: CountdownCard, ReactivateCard, cancelling-specific usage stats (inline, NOT the existing UsageStatsCard — see below)
    - The usage stats section in the right column uses **cancelling-specific styling**: remaining credits in `text-brand-orange` (not green), expiration date in `text-brand-red` (not muted), "Propadnutí" label instead of "Next renewal". Desktop: 2×2 grid. Mobile: 4-column grid with compact cells. Implement this inline in CancellingView or as a small sub-section — do NOT modify the existing `UsageStatsCard.svelte`.
    - Manage ReactivateModal state (open/close/loading/error)
    - Call `billingClient.reactivateSubscription()` on confirm, then `billingStore.refresh()`
    - On successful reactivation, the view will naturally switch to active management UI via store reactivity
    - _Requirements: 2.1, 2.2, 2.3, 7.3, 8.1, 8.2_

- [ ] 8. Integrate CancellingView into pricing page routing
  - [ ] 8.1 Add the third branch for `isCancellingPlan` in the pricing page
    - In `+page.svelte`, add a new conditional branch after the error state and before `showManagementUI`
    - When `billingStore.isCancellingPlan === true`, render `<CancellingView>`
    - Pass all required props from billingStore and authStore.subscription
    - Import CancellingView component
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The design uses TypeScript (frontend) and Go (backend) — no pseudocode language selection needed
- The `isCancelledWithFutureAccess` logic is being removed because the backend now properly returns `'cancelling'` status instead of `'cancelled'` during the grace period
- All new Svelte components use Svelte 5 runes, Tailwind CSS 4, and Paraglide i18n via `tx()`

### CRITICAL: Design Reference

**All UI components in tasks 6.x and 7.x MUST match the HTML design mockups exactly:**
- Desktop: `frontend/metacleaner-app/.design/metacleaner-ending-subscription-desktop.html`
- Mobile: `frontend/metacleaner-app/.design/metacleaner-ending-subscription-mobile.html`

These HTML files are the **single source of truth** for:
- Layout structure (grid columns, gaps, padding)
- Tailwind CSS classes (colors, borders, shadows, spacing, typography)
- Icon usage (Font Awesome classes)
- Responsive breakpoints (desktop vs mobile variants)
- Visual hierarchy and element ordering

When implementing each component, **read the corresponding section from the mockup HTML** and replicate its structure, classes, and styling exactly — adapting only for Svelte component patterns (props, `tx()` for text, reactive data instead of hardcoded values).

### CRITICAL: Consistency with the rest of the application

The `.design` mockups define only the **main content area** (the `<main>` section). The implementation MUST remain consistent with the rest of the application — specifically:
- The page uses the **existing global layout** (`+layout.svelte`) which provides NavBar, footer, auth guard, and billing sync. Do NOT replicate the navbar/footer from the mockup HTML — those are placeholder elements in the mockup only.
- The `<main>` wrapper must use the same `max-w-[1100px]` container and padding as the existing pricing page (`px-4 py-8 lg:px-6 lg:py-10`).
- Follow the same **component patterns** as other sections in the app (e.g., `CurrentPlanCard.svelte`, `UsageStatsCard.svelte`) — same Props interface style, same `$props()` destructuring, same `$derived` patterns.
- Use the **existing theme tokens** from `layout.css` (`navy-main`, `navy-card`, `navy-lighter`, `brand-green`, `brand-orange`, `brand-red`, `brand-blue`, `text-main`, `text-muted`, etc.) — do not introduce new color values.
- Use `tx()` from `$lib/shared/utils/i18n` for all text — matching how other pages handle i18n.
- Use `formatDate()` from `$lib/shared/utils/planHierarchy` for date formatting — same as `CurrentPlanCard` and `UsageStatsCard`.
- Reuse the existing `ConfirmationModal` pattern or match its interaction style for the ReactivateModal.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "4.1", "5.1", "5.2"] },
    { "id": 1, "tasks": ["1.2", "2.2", "4.2", "6.0"] },
    { "id": 2, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6"] },
    { "id": 3, "tasks": ["7.1"] },
    { "id": 4, "tasks": ["8.1"] }
  ]
}
```

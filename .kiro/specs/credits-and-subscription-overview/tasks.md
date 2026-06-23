# Implementation Plan: Credits and Subscription Overview

## Overview

This plan implements credit balance visibility, subscription plan display, credit cost awareness, and feature gating across the MetaCleaner frontend app. The implementation follows a dependency-first order: pure utilities → API client additions → reactive store → UI components → integration into existing components → i18n → tests.

## Tasks

- [x] 1. Create pure utility modules
  - [x] 1.1 Create `formatCredits.ts` utility
    - Create `src/lib/shared/utils/formatCredits.ts`
    - Implement `formatCreditCount(n: number): string` — returns string representation for n ≤ 99,999, returns "99,999+" for n > 99,999
    - Implement `getCreditColorScheme(balance: number): 'warning' | 'success'` — returns 'warning' when balance is 0, 'success' otherwise
    - _Requirements: 1.2, 1.3, 1.4, 10.6_

  - [x] 1.2 Create `planStyleMap.ts` utility
    - Create `src/lib/shared/utils/planStyleMap.ts`
    - Define `PlanStyle` interface with dotColor, glowColor, borderColor, bgGradient, textColor, icon, label fields
    - Define `PLAN_CONFIG` constant with monthlyAllowance for each plan (free=3, pro=100, proplus=100)
    - Implement `getPlanStyle(planId: string | null, status: string | null): PlanStyle` — returns gray/lock for free/null/cancelled, blue/star for pro active/trialing, orange/star for proplus active/trialing
    - _Requirements: 2.2, 2.3, 2.4, 10.2_

  - [x] 1.3 Create `creditPlural.ts` utility
    - Create `src/lib/shared/utils/creditPlural.ts`
    - Implement `creditLabel(count: number, locale: 'en' | 'cs'): string` — English: "credit"/"credits"; Czech: "kredit"/"kredity"/"kreditů" based on count
    - _Requirements: 11.3_

  - [x] 1.4 Create `creditCost.ts` utility
    - Create `src/lib/shared/utils/creditCost.ts`
    - Implement `computeTotalCost(files: Array<{ type: string }>): number` — returns count of files whose type is NOT "unknown"
    - Implement `computeProgressRatio(remaining: number, allowance: number): number` — returns clamped [0, 1] ratio, 0 when allowance is 0
    - Implement `isInsufficientCredits(totalCost: number, creditBalance: number): boolean` — returns true when totalCost > creditBalance
    - _Requirements: 3.5, 4.5, 5.1, 5.5, 6.1_

- [x] 2. Extend API client and create billing store
  - [x] 2.1 Add billing API functions to `metaCleanerApi.ts`
    - Add `SubscriptionResponse`, `CreditsResponse`, and `CreditTransaction` interfaces
    - Implement `getSubscription(): Promise<SubscriptionResponse>` — calls `GET /api/billing/subscription`
    - Implement `getCredits(): Promise<CreditsResponse>` — calls `GET /api/billing/credits`
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 2.2 Create `billingStore.svelte.ts`
    - Create `src/lib/stores/billingStore.svelte.ts`
    - Implement reactive state using `$state`: credits (number | null), subscriptionCredits, purchasedCredits, planId, planStatus, isLoading, hasError
    - Implement derived getters: `isFreeUser`, `isPaidPlan`, `monthlyAllowance`
    - Implement `refresh()` — fetches both subscription and credits endpoints; retains last known value on failure (Req 9.4, 9.5)
    - Implement `refreshCreditsOnly()` — lightweight refresh for post-cleaning updates
    - Implement `clear()` — resets state on logout
    - Handle initial load state: display null credits until first successful fetch (Req 9.6)
    - On error with previous data: keep last known values and set `hasError = true` (Req 9.4)
    - _Requirements: 1.7, 1.8, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 3. Checkpoint - Ensure utilities and store compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create new UI components
  - [x] 4.1 Create `CreditBalanceIndicator` component
    - Create `src/lib/shared/components/CreditBalanceIndicator.svelte`
    - Props: credits (number | null), isLoading, hasError, compact (boolean, for mobile)
    - Render pill with pulsing green dot (2s cycle), bolt icon, credit count, and localized "credits" label
    - Show skeleton placeholder when isLoading and credits is null
    - Hide entirely when hasError and no cached data (Req 1.8)
    - When hasError but cached data exists: show the cached credit count with a small warning icon (⚠️ or fa-exclamation-triangle) adjacent to the pill to indicate stale data (Req 9.4)
    - Use warning style (orange/red) when credits === 0
    - In compact mode: omit "credits" label (mobile navbar)
    - Use `formatCreditCount` for display, `getCreditColorScheme` for styling
    - Co-locate a `CreditBalanceIndicator.stories.svelte` file with states: loaded, loading (skeleton), zero credits (warning), high count, compact mode, stale data (warning icon)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 9.4_

  - [x] 4.2 Create `PlanPill` component
    - Create `src/lib/shared/components/PlanPill.svelte`
    - Props: planId (string), planStatus (string)
    - Render pill with 6px dot, lock/star icon, plan name text using `getPlanStyle`
    - On click: navigate to `/pricing`
    - Apply hover state (lighter border + background, 200ms transition)
    - Co-locate a `PlanPill.stories.svelte` file with states: Free, Pro, Pro+, hover states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7_

  - [x] 4.3 Create `CreditsBanner` section component
    - Create `src/routes/sections/CreditsBanner.svelte`
    - Props: credits, subscriptionCredits, monthlyAllowance, planId, planStatus, isPaidPlan
    - Render bolt icon, "Credit balance" label, plan badge (using getPlanStyle), remaining X of Y text, horizontal progress bar
    - Include upgrade CTA button ("Get Pro plan") with orange gradient — hidden for paid plans
    - Mobile: compact single-row layout below lg breakpoint
    - Use `computeProgressRatio` for bar width
    - Co-locate a `CreditsBanner.stories.svelte` file with states: Free with low credits, Pro (no CTA), zero credits, mobile compact
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.4 Create `CostBadge` element
    - Create `src/lib/shared/elements/CostBadge.svelte`
    - Props: cost (number)
    - Render small badge with bolt icon and cost number in green styling (green text, green border, semi-transparent green background)
    - Co-locate a `CostBadge.stories.svelte` file with state: standard (cost=1)
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.5 Create `CreditSummaryRow` component
    - Create `src/routes/(step1)/components/CreditSummaryRow.svelte`
    - Props: totalCost, fileCount, creditBalance (number | null)
    - Render info icon, "Cleaning cost for X files" text, total badge with bolt icon
    - Apply warning style when insufficient credits (orange/red border and text)
    - Show insufficient credits message with link to pricing when credits < cost
    - Neutral style when balance is null (unknown)
    - Co-locate a `CreditSummaryRow.stories.svelte` file with states: normal, warning (insufficient), neutral (balance unknown)
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6, 6.2, 6.3, 6.4_

  - [x] 4.6 Create `ProOverlay` component
    - Create `src/routes/(step1)/components/ProOverlay.svelte`
    - Self-contained — reads i18n keys internally, no props needed
    - Render lock icon with Pro star badge, "Risk Scanner" title + "PRO" badge, description, feature preview chips (GPS detection, Identity, Risk score), upgrade CTA button, price hint text
    - Background: vertical gradient from 0% opacity top to ≥85% opacity bottom
    - CTA navigates to `/pricing`
    - Co-locate a `ProOverlay.stories.svelte` file showing the full overlay with all elements
    - _Requirements: 7.2, 7.3, 7.4, 7.6_

  - [x] 4.7 Create `UpgradeModal` component
    - Create `src/lib/shared/components/UpgradeModal.svelte`
    - Props: onDismiss (() => void)
    - Render lock icon, title, description (cleaning history, file details, PDF), upgrade CTA button (navigates to pricing), dismiss button (calls onDismiss)
    - Style consistently with ProOverlay (orange gradient CTA, lock icon, Pro badge)
    - Co-locate an `UpgradeModal.stories.svelte` file showing the full modal with all elements
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 5. Checkpoint - Ensure new components compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Integrate into existing components
  - [x] 6.1 Modify `NavBar.svelte` to include credit and plan pills
    - Import billingStore and pass state to CreditBalanceIndicator and PlanPill
    - Position CreditBalanceIndicator between LanguageDropdown and UserDropdown (desktop)
    - Position PlanPill between CreditBalanceIndicator and LanguageDropdown (desktop)
    - Add compact CreditBalanceIndicator to mobile navbar (next to hamburger)
    - Hide PlanPill on mobile viewports (Req 2.8)
    - _Requirements: 1.5, 1.6, 2.5, 2.8, 2.9_

  - [x] 6.2 Modify `MobileHamburgerMenu.svelte` to show credit and plan info
    - Add credit section card below user info: pulsing green dot, bolt icon, credit count, "credits remaining" text, progress bar, "of X" allowance text
    - Display plan name with color scheme from getPlanStyle in user info section
    - Add upgrade CTA button at bottom for Free users (hidden for paid plans)
    - Switch credit section to warning style when balance is zero
    - Use semi-transparent green background/border for credit card container
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 6.3 Modify `FileListItemRisk.svelte` to show cost badge
    - Add CostBadge (cost=1) to right side of each file row, before format badge
    - Hide CostBadge when file type is "unknown"
    - Show CostBadge even during "pending" or "scanning" states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 6.4 Modify Step2 (FilesReady) to integrate billing UI
    - Add CreditsBanner above file list
    - Add CreditSummaryRow below file list
    - Add CostIndicatorButton (pill with bolt icon + total cost) inside "Start Cleaning" button
    - Disable Start Cleaning button when credits < total cost (reduced opacity, cursor not-allowed, no hover)
    - Show insufficient credits message below CreditSummaryRow with pricing link
    - Re-enable button when files removed and cost ≤ balance
    - On mobile: ensure the MobileBottomCta (fixed bottom bar) also shows the CostIndicatorButton and respects the same disabled/insufficient state as the desktop button
    - _Requirements: 3.1, 5.1, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.5 Add feature gating to Risk Scanner card in Step2
    - When billingStore.isFreeUser is true: blur Risk Scanner card content (CSS blur 4px, pointer-events disabled)
    - Render ProOverlay over the blurred content
    - When isPaidPlan: render Risk Scanner normally
    - When subscription status is unknown (error): default to showing ProOverlay
    - _Requirements: 7.1, 7.2, 7.5, 7.7_

  - [x] 6.6 Add feature gating to reports pages
    - Modify `/reports` page: show UpgradeModal for Free users, skeleton while loading, normal content for paid users
    - Modify `/report/[id]` page: show UpgradeModal for Free users, skeleton while loading, normal content for paid users
    - UpgradeModal dismiss navigates to `/`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

  - [x] 6.7 Wire billing store refresh triggers
    - Call `billingStore.refresh()` after successful authentication in authStore
    - Call `billingStore.refreshCreditsOnly()` after cleaning job completion in cleaning service
    - Call `billingStore.refresh()` on Stripe checkout success URL detection
    - Call `billingStore.clear()` on logout
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 7. Checkpoint - Ensure all integration compiles
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Add i18n translation keys
  - [x] 8.1 Add English translation keys to `messages/en.json`
    - Add keys for: CreditBalanceIndicator ("credits"), PlanPill labels, CreditsBanner (title, remaining text, upgrade CTA), CostBadge label, CreditSummaryRow (cost text, insufficient message), ProOverlay (title, description, chips, CTA, price hint), UpgradeModal (title, description, CTA, dismiss)
    - Keep plan names in English (Free, Pro, Pro+) — not translated
    - _Requirements: 11.1, 11.2, 11.4, 11.5_

  - [x] 8.2 Add Czech translation keys to `messages/cs.json`
    - Mirror all English keys with Czech translations
    - Use Czech plural forms via creditPlural utility where applicable
    - Price hint: "2,99 €/měsíc" format
    - Plan names remain in English (Free, Pro, Pro+)
    - _Requirements: 11.1, 11.3, 11.4, 11.5_

- [x] 9. Write property-based tests for utility modules
  - [x]* 9.1 Write property test for `formatCreditCount`
    - **Property 1: Credit display formatting**
    - For any non-negative integer n: returns string(n) when n ≤ 99999, returns "99,999+" when n > 99999
    - Use fast-check with `fc.nat()` arbitrary
    - **Validates: Requirements 1.2**

  - [x]* 9.2 Write property test for `getCreditColorScheme`
    - **Property 2: Credit balance color scheme determination**
    - For any non-negative integer: returns 'warning' when 0, 'success' when > 0
    - Use fast-check with `fc.nat()` arbitrary
    - **Validates: Requirements 1.3, 1.4, 10.6**

  - [x]* 9.3 Write property test for `getPlanStyle`
    - **Property 3: Plan-to-style mapping consistency**
    - For any combination of planId and status from defined sets: returns correct style (gray/lock for free/null/cancelled, blue/star for pro active/trialing, orange/star for proplus active/trialing)
    - Use fast-check with `fc.constantFrom(...)` for plan IDs and statuses
    - **Validates: Requirements 2.2, 2.3, 2.4, 10.2**

  - [x]* 9.4 Write property test for `computeProgressRatio`
    - **Property 4: Progress bar ratio computation**
    - For any pair (remaining, allowance) with allowance > 0: ratio equals Math.min(remaining/allowance, 1) clamped to [0, 1]. When allowance is 0, ratio is 0.
    - Use fast-check with `fc.nat()` for both values
    - **Validates: Requirements 3.2, 3.5**

  - [x]* 9.5 Write property test for `computeTotalCost`
    - **Property 5: Total credit cost computation**
    - For any array of files with type field: returns count of files whose type is NOT "unknown"
    - Use fast-check with `fc.array(fc.record({ type: fc.constantFrom('image', 'video', 'unknown') }))`
    - **Validates: Requirements 5.1, 5.2**

  - [x]* 9.6 Write property test for `isInsufficientCredits`
    - **Property 6: Insufficient credits determination**
    - For any pair (totalCost, creditBalance): returns true when totalCost > creditBalance, false otherwise
    - Use fast-check with `fc.nat()` for both values
    - **Validates: Requirements 5.5, 6.1, 6.2, 6.5**

  - [x]* 9.7 Write property test for `creditLabel`
    - **Property 7: Czech credit plural forms**
    - For any non-negative integer n: cs locale returns "kredit" (n=1), "kredity" (n 2-4), "kreditů" (else); en locale returns "credit" (n=1), "credits" (else)
    - Use fast-check with `fc.nat()` arbitrary
    - **Validates: Requirements 11.3**

- [x] 10. Write unit tests for store and components
  - [x]* 10.1 Write unit tests for `billingStore`
    - Test initial state (credits null, isLoading false)
    - Test refresh success: updates all state fields
    - Test refresh failure with no cached data: hasError true, credits null
    - Test refresh failure with cached data: retains previous values, sets hasError
    - Test clear: resets all state
    - Test derived getters: isFreeUser, isPaidPlan, monthlyAllowance
    - _Requirements: 9.1, 9.4, 9.5, 9.6_

  - [x]* 10.2 Write unit tests for UI components
    - CreditBalanceIndicator: renders correct count, skeleton on loading, hides on error, warning on zero
    - PlanPill: renders correct style per plan, click navigates to /pricing
    - CreditsBanner: shows/hides upgrade CTA based on plan
    - CreditSummaryRow: warning state when insufficient, neutral when balance unknown
    - ProOverlay: renders all required elements (lock, title, chips, CTA, price hint)
    - UpgradeModal: renders all elements, dismiss calls onDismiss
    - _Requirements: 1.1–1.8, 2.1–2.9, 3.1–3.6, 5.1–5.6, 7.2–7.4, 8.3, 8.5_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- All components use Svelte 5 runes, TypeScript strict mode, and Tailwind CSS 4
- i18n uses Paraglide JS with the `tx()` helper pattern
- Each new component task (4.1–4.7) includes co-located Storybook stories covering all visual states
- Loading states strategy: skeleton placeholder is shown when `isLoading && credits === null` (initial fetch); when cached data exists and a refresh fails, the previous value is shown with a warning icon (no skeleton)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.4", "4.6", "4.7"] },
    { "id": 4, "tasks": ["4.3", "4.5"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "6.6"] },
    { "id": 6, "tasks": ["6.4", "6.5", "6.7"] },
    { "id": 7, "tasks": ["8.1", "8.2"] },
    { "id": 8, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7"] },
    { "id": 9, "tasks": ["10.1", "10.2"] }
  ]
}
```

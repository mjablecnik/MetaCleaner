# Implementation Plan: Subscription Management

## Overview

This plan implements the subscription management feature that extends the `/pricing` page to show a management UI for active subscribers. It covers backend endpoints for plan changes and cancellation (Go + Stripe), frontend components (Svelte 5 + Tailwind), billing client extensions (TypeScript), i18n keys, and property-based tests for both layers.

## Tasks

- [ ] 1. Add frontend types and billing client methods
  - [ ] 1.1 Add ChangePlanResponse and CancelResponse types to billing.ts
    - Add `ChangePlanResponse` interface with `plan_id`, `billing_period`, `status`, `current_period_end`, optional `prorated_amount`, optional `scheduled_change_date`
    - Add `CancelResponse` interface with `current_period_end`
    - _Requirements: 12.1, 12.2_
  - [ ] 1.2 Extend billingClient.ts with changePlan() and cancelSubscription() methods
    - Add `changePlan(planId: string, billingPeriod: 'monthly' | 'yearly'): Promise<ChangePlanResponse>` method
    - Add `cancelSubscription(): Promise<CancelResponse>` method
    - Both include Bearer token in Authorization header, POST to respective endpoints, parse error responses per design
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ]* 1.3 Write property test for billing client error parsing (Property 11)
    - **Property 11: Billing Client Error Response Parsing**
    - For any HTTP response with status ≥ 300: if body is valid JSON with `message` field, throw Error with that message; otherwise throw Error with status text
    - **Validates: Requirements 12.3, 12.4**

- [ ] 2. Implement backend change-plan and cancel endpoints
  - [ ] 2.1 Add HandleChangePlan handler in billing_handlers.go
    - Add `ChangePlanRequest`, `ChangePlanResponse`, `CancelResponse` structs
    - Implement `HandleChangePlan(cfg Config, db *SupabaseClient) http.HandlerFunc`
    - Validate JWT auth, validate request body (plan_id ∈ {pro, proplus}, billing_period ∈ {monthly, yearly})
    - Fetch user subscription, check no active sub → 400, same plan → 409
    - Determine upgrade vs downgrade via plan hierarchy
    - Upgrade: Stripe subscription update with proration, return `prorated_amount`
    - Downgrade: Stripe SubscriptionSchedule at period end, return `scheduled_change_date`
    - Update DB, return 200 with response
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - [ ] 2.2 Add HandleCancelSubscription handler in billing_handlers.go
    - Implement `HandleCancelSubscription(cfg Config, db *SupabaseClient) http.HandlerFunc`
    - Validate JWT auth, fetch subscription, check no sub → 400, already cancelled → 400
    - Call Stripe `CancelAtPeriodEnd: true`
    - Update DB status to "cancelling"
    - Return 200 with `current_period_end`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ] 2.3 Register new routes in router.go
    - Add `POST /api/billing/change-plan` → `rateLimited(HandleChangePlan(cfg, db))`
    - Add `POST /api/billing/cancel` → `rateLimited(HandleCancelSubscription(cfg, db))`
    - _Requirements: 8.1, 9.1_
  - [ ]* 2.4 Write property tests for change-plan input validation (Property 9)
    - **Property 9: Change-Plan Input Validation**
    - Generate random invalid request bodies (invalid plan_id, invalid billing_period, missing fields), verify HTTP 400 with ErrorResponse format
    - Use `pgregory.net/rapid` in `tests/` directory
    - **Validates: Requirements 8.4**
  - [ ]* 2.5 Write property test for same-plan conflict (Property 10)
    - **Property 10: Change-Plan Same-Plan Conflict**
    - Generate matching plan_id and billing_period pairs, verify HTTP 409 with error code "BILLING_CONFLICT"
    - **Validates: Requirements 8.6**
  - [ ]* 2.6 Write property tests for upgrade/downgrade routing (Properties 7 and 8)
    - **Property 7: Change-Plan Upgrade Applies Immediately with Proration**
    - **Property 8: Change-Plan Downgrade Schedules at Period End**
    - Generate plan transitions, verify correct Stripe call type with mocked Stripe client
    - **Validates: Requirements 8.2, 8.3**

- [ ] 3. Checkpoint - Ensure backend compiles and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create shared utility functions and plan hierarchy
  - [ ] 4.1 Create plan hierarchy utility and formatting helpers
    - Add `PLAN_HIERARCHY` constant (`{ free: 0, pro: 1, proplus: 2 }`) in a shared utils file (e.g. `src/lib/shared/utils/planHierarchy.ts`)
    - Add `isUpgrade(current, target)` and `isDowngrade(current, target)` helper functions
    - Add `formatCurrency(amount: number, locale: 'en' | 'cs'): string` utility
    - Add `formatDate(date: Date | string, locale: 'en' | 'cs'): string` utility
    - _Requirements: 10.2, 10.3_
  - [ ]* 4.2 Write property tests for credit usage bar computation (Property 2)
    - **Property 2: Credit Usage Bar Percentage Computation**
    - For any non-negative `used` and `allowance`: width = `Math.min(used / allowance, 1) * 100` when `allowance > 0`, 0 when `allowance === 0`, always in [0, 100]
    - **Validates: Requirements 2.2**
  - [ ]* 4.3 Write property tests for currency formatting (Property 3)
    - **Property 3: Currency Formatting by Locale**
    - For any numeric amount and locale ∈ {en, cs}: English places € before amount with period decimal, Czech places amount before € with comma decimal
    - **Validates: Requirements 10.2**
  - [ ]* 4.4 Write property tests for date formatting (Property 4)
    - **Property 4: Date Formatting by Locale**
    - For any valid Date and locale ∈ {en, cs}: Czech uses DD.MM.YYYY with dots, English uses MM/DD/YYYY with slashes
    - **Validates: Requirements 10.3**
  - [ ]* 4.5 Write property test for usage stats computation (Property 6)
    - **Property 6: Usage Stats Computation**
    - For any non-negative `subscriptionCredits`, `purchasedCredits`, `monthlyAllowance`: verify `creditsConsumed = Math.max(0, monthlyAllowance - (subscriptionCredits + purchasedCredits))` and `creditsRemaining = subscriptionCredits + purchasedCredits`
    - **Validates: Requirements 6.1**

- [ ] 5. Implement subscription management components
  - [ ] 5.1 Create ConfirmationModal.svelte in src/lib/shared/sections/
    - Accept props: `title`, `content` (Svelte snippet), `confirmLabel`, `cancelLabel`, `confirmStyle`, `isLoading`, `error`, `onConfirm`, `onCancel`
    - Desktop: centered dialog overlay (max-w-[480px], rounded-2xl, fade-in 200ms)
    - Mobile: bottom sheet (rounded-t-2xl, slide-up 300ms)
    - Backdrop click/tap closes modal
    - Respect `prefers-reduced-motion`
    - Loading state: spinner on confirm button, both buttons disabled
    - Error display below action buttons
    - _Requirements: 7.3, 7.4, 11.3_
  - [ ] 5.2 Create CurrentPlanCard.svelte in src/lib/shared/sections/
    - Display plan name, price (locale-formatted), billing period
    - Credit usage bar with percentage-width fill (clamped [0, 100])
    - Credits used / remaining / renewal date text
    - Feature list from plan config
    - Billing info (payment method, next payment date) — hidden for free plan
    - Skeleton state when loading
    - Warning indicator on stale data
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_
  - [ ] 5.3 Create UpgradeCard.svelte in src/lib/shared/sections/
    - Display target plan name, price, differential features gained
    - Upgrade button triggers `onUpgrade` callback
    - Not rendered when user is on highest plan (Pro+)
    - _Requirements: 3.1, 3.2, 3.9_
  - [ ] 5.4 Create DowngradeCard.svelte in src/lib/shared/sections/
    - Display target plan name, price, features lost
    - Downgrade button triggers `onDowngrade` callback
    - Not rendered when user is on lowest paid plan (Pro)
    - _Requirements: 4.1, 4.2, 4.9_
  - [ ] 5.5 Create CancelSection.svelte in src/lib/shared/sections/
    - Warning message about reverting to free plan (3 photos/month, no reports)
    - Cancel button triggers `onCancel` callback
    - Visible only when planStatus is active/trialing with plan_id pro/proplus
    - _Requirements: 5.1, 5.2, 5.9_
  - [ ] 5.6 Create UsageStatsCard.svelte in src/lib/shared/sections/
    - Display credits consumed, credits remaining, monthly allowance, renewal date (locale-formatted)
    - Reactive to billing store updates
    - Skeleton when first loading, warning on stale data
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6. Checkpoint - Ensure components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Integrate subscription management into pricing page
  - [ ] 7.1 Update /pricing +page.svelte with conditional rendering
    - Import billingStore, check `isPaidPlan` to decide which view to render
    - If `isPaidPlan`: render Subscription Management UI with responsive grid (`lg:grid-cols-5`)
    - If `!isPaidPlan`: render existing PricingHeaderSection + PricingPlansSection
    - If `isLoading && credits === null`: render skeleton state
    - If cancelled with future `current_period_end`: render management UI with cancellation notice
    - Wire UpgradeCard/DowngradeCard/CancelSection to open ConfirmationModal with appropriate content
    - Handle confirm callbacks: call billingClient methods, refresh store on success, display errors on failure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 7.1, 7.2, 11.4, 11.5, 11.6_
  - [ ]* 7.2 Write property test for conditional rendering logic (Property 1)
    - **Property 1: Conditional Page Rendering**
    - For any billing store state: Subscription Management UI renders iff `isPaidPlan` is true (status ∈ {active, trialing} AND planId ∈ {pro, proplus})
    - **Validates: Requirements 1.1, 1.2, 11.4, 11.5**
  - [ ]* 7.3 Write property test for cancel section visibility (Property 5)
    - **Property 5: Cancel Section Visibility**
    - For any billing store state: Cancel Section visible iff planStatus ∈ {active, trialing} AND planId ∈ {pro, proplus}. Not visible when status is free/cancelled or planId is free
    - **Validates: Requirements 5.1, 5.9**

- [ ] 8. Add i18n translation keys
  - [ ] 8.1 Add subscription management i18n keys to messages/en.json and messages/cs.json
    - Add keys for: page header, current plan card labels, upgrade card labels, downgrade card labels, cancel section warnings, usage stats labels, modal titles/bodies/buttons, error messages, date/currency formatting hints
    - Ensure plan names (Free, Pro, Pro+) remain untranslated brand identifiers in both locales
    - _Requirements: 10.1, 10.4, 10.5_

- [ ] 9. Update architecture documentation
  - [ ] 9.1 Update architecture/workspace.dsl if significant architectural changes were introduced
    - Review if the new billing endpoints (change-plan, cancel) or the subscription management component layer represent a meaningful architectural change
    - If yes, update the Structurizr DSL to reflect new relationships or components (e.g., new Stripe interaction flows from the backend, new component-level views if applicable)
    - Follow the conventions in the `docs-architecture.md` steering file (short descriptions, no overflow, deduplication)

- [ ] 10. Final checkpoint - Ensure all tests pass and both frontend and backend compile
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses TypeScript (frontend) and Go (backend) — no language selection needed
- Frontend property tests use Vitest + fast-check; backend property tests use Go testing + rapid

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 2, "tasks": ["1.3", "2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "2.6", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6"] },
    { "id": 5, "tasks": ["7.1", "8.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "9.1"] }
  ]
}
```

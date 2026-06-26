# Requirements Document

## Introduction

This feature implements the "ending subscription" intermediate state in the MetaCleaner app's pricing/subscription page. When a user cancels their subscription, the system transitions to a `cancelling` status (grace period) where the subscription remains active until the billing period ends. The frontend currently lacks proper handling of this state — the billing store misclassifies it, and there is no dedicated UI. This spec covers fixing the billing store logic, building the new "ending subscription" view with all required sections (banner, countdown, reactivate CTA, usage stats, etc.), adding a backend reactivation endpoint, and supporting i18n in both English and Czech.

## Glossary

- **Billing_Store**: The Svelte 5 reactive store (`billingStore.svelte.ts`) managing subscription status, plan ID, and credits on the frontend
- **Cancelling_State**: The intermediate subscription status (`'cancelling'`) indicating the user has cancelled but the subscription remains active until `current_period_end`
- **Reactivate_Endpoint**: The backend `POST /api/billing/reactivate` endpoint that reverses a cancellation by setting `cancel_at_period_end: false` on Stripe
- **Pricing_Page**: The SvelteKit route at `/pricing` that shows either subscription management UI (paid users) or the pricing grid (free users)
- **Billing_Client**: The frontend HTTP client (`billingClient.ts`) for billing API calls
- **Period_End_Date**: The `current_period_end` timestamp from the subscription indicating when access expires
- **Countdown_Card**: A UI section displaying days, hours, minutes remaining until access expires
- **Reactivate_Card**: A green-bordered CTA card encouraging the user to resume their subscription
- **Cancellation_Banner**: An orange-bordered banner at the top of the page informing the user about the cancelled state

## Requirements

### Requirement 1: Billing Store Status Handling

**User Story:** As a developer, I want the billing store to correctly classify the `cancelling` status, so that the frontend shows the appropriate UI for users in the grace period.

#### Acceptance Criteria

1. WHILE the plan status is `'cancelling'`, THE Billing_Store SHALL report `isFreeUser` as `false`
2. WHILE the plan status is `'cancelling'`, THE Billing_Store SHALL report `isPaidPlan` as `false`
3. WHEN the billing store refreshes and receives `planStatus === 'cancelling'`, THE Billing_Store SHALL expose a derived property `isCancellingPlan` that returns `true`
4. WHILE the plan status is `'cancelling'` and `planId` is `'pro'` or `'proplus'`, THE Billing_Store SHALL preserve `monthlyAllowance` at the paid plan level

### Requirement 2: Cancelling State View Routing

**User Story:** As a user who cancelled my subscription, I want to see a dedicated "ending subscription" view instead of the pricing grid or active subscription view, so that I clearly understand my current access status.

#### Acceptance Criteria

1. WHEN the billing store reports `isCancellingPlan === true`, THE Pricing_Page SHALL display the ending subscription view instead of the active management UI or pricing grid
2. WHEN the billing store reports `isCancellingPlan === true`, THE Pricing_Page SHALL display the page header with an orange crown icon, "Your Subscription" title, and an orange badge showing "Cancelled · Active until {date}"
3. WHEN the ending subscription view is displayed on mobile, THE Pricing_Page SHALL show the badge as a compact "Cancelled" label without the date text

### Requirement 3: Cancellation Banner

**User Story:** As a user in the cancelling state, I want to see a prominent banner informing me about the cancellation and offering a quick reactivation button, so that I am immediately aware of my status and can easily reverse the decision.

#### Acceptance Criteria

1. WHEN the ending subscription view is displayed, THE Cancellation_Banner SHALL appear at the top with an orange border, a clock icon, "Subscription was cancelled" title, and the access end date
2. WHEN the ending subscription view is displayed on desktop, THE Cancellation_Banner SHALL show a "Reactivate" green button inline with the banner content
3. WHEN the ending subscription view is displayed on mobile, THE Cancellation_Banner SHALL show a full-width "Reactivate" green button below the banner text
4. WHEN the user clicks the reactivation button in the banner, THE Cancellation_Banner SHALL open the reactivation confirmation modal

### Requirement 4: Current Plan Card (Cancelling State)

**User Story:** As a user in the cancelling state, I want to see my current plan details styled to indicate expiration, so that I understand what I still have access to and when it ends.

#### Acceptance Criteria

1. WHEN the ending subscription view is displayed, THE Pricing_Page SHALL show a current plan card with an orange border and "Expiring plan" badge
2. THE current plan card SHALL display the plan name with a "Cancelled" orange tag and the price crossed out
3. THE current plan card SHALL display a credits progress bar showing current usage with a note that credits expire on the period end date
4. THE current plan card SHALL display a transition timeline with three nodes: "Today" (green, active), the downgrade date (orange), and "Free plan" (grey, locked)
5. THE current plan card SHALL display the list of features available until the period end date with green check icons

### Requirement 5: Countdown Card

**User Story:** As a user in the cancelling state, I want to see a live countdown of remaining access time, so that I have a clear sense of urgency about my expiring subscription.

#### Acceptance Criteria

1. WHEN the ending subscription view is displayed, THE Countdown_Card SHALL show the remaining time in days, hours, and minutes format
2. THE Countdown_Card SHALL display a progress bar indicating the proportion of time elapsed since cancellation
3. THE Countdown_Card SHALL display the exact access end date and time below the progress bar
4. WHEN the countdown reaches zero, THE Countdown_Card SHALL display "0" for all time units

### Requirement 6: Reactivation CTA Card

**User Story:** As a user in the cancelling state, I want to see a clear call-to-action card for reactivation with benefits listed, so that I can make an informed decision to resume my subscription.

#### Acceptance Criteria

1. WHEN the ending subscription view is displayed, THE Reactivate_Card SHALL show a green-bordered card with the plan price and a list of benefits (immediate reactivation, credits preserved, next payment on original date)
2. WHEN the user clicks the reactivate button on the card, THE Reactivate_Card SHALL open the reactivation confirmation modal
3. THE Reactivate_Card SHALL display the "Reactivate" button as a full-width green button with a right-arrow indicator

### Requirement 7: Reactivation Confirmation Modal

**User Story:** As a user about to reactivate, I want to see a confirmation modal with plan details and billing information, so that I can confirm the action with full transparency about costs.

#### Acceptance Criteria

1. WHEN the reactivation modal is opened, THE Pricing_Page SHALL display the plan name and price, a "€0 charge today" line item, and the next payment date
2. WHEN the reactivation modal is opened, THE Pricing_Page SHALL display a green info box explaining that the plan will be immediately reactivated with no interruption
3. WHEN the user confirms reactivation, THE Pricing_Page SHALL call the reactivate endpoint and transition the UI to the active subscription management view upon success
4. WHILE the reactivation request is in progress, THE Pricing_Page SHALL display a loading indicator on the confirm button and disable all modal interactions
5. IF the reactivation request fails, THEN THE Pricing_Page SHALL display an inline error message within the modal without closing it

### Requirement 8: Usage Stats Card (Cancelling State)

**User Story:** As a user in the cancelling state, I want to see my current credit usage statistics with expiration styling, so that I understand how many credits I have left before they expire.

#### Acceptance Criteria

1. WHEN the ending subscription view is displayed, THE Pricing_Page SHALL show a usage stats card with four metrics: processed, remaining, total/month, and expiration date
2. THE usage stats card SHALL display the remaining credits in orange and the expiration date in red to indicate urgency

### Requirement 9: "What Happens After" Card

**User Story:** As a user in the cancelling state, I want to understand what I will lose and retain after the period ends, so that I can decide whether to reactivate.

#### Acceptance Criteria

1. WHEN the ending subscription view is displayed, THE Pricing_Page SHALL show a card titled "What happens after {date}?" listing items that will be lost (credits, Risk Scanner, PDF reports) with red X icons and items that remain (3 free photos/month) with green check icons
2. WHEN the ending subscription view is displayed on mobile, THE Pricing_Page SHALL display this card as a collapsible accordion

### Requirement 10: Backend Reactivation Endpoint

**User Story:** As a system, I want a reactivation endpoint that reverses a Stripe cancellation, so that users can resume their subscription without a new checkout.

#### Acceptance Criteria

1. WHEN an authenticated user sends a POST request to `/api/billing/reactivate`, THE Reactivate_Endpoint SHALL call Stripe's subscription update with `cancel_at_period_end: false`
2. WHEN the Stripe update succeeds, THE Reactivate_Endpoint SHALL update the database subscription status from `'cancelling'` back to `'active'`
3. WHEN the Stripe update succeeds, THE Reactivate_Endpoint SHALL return the updated subscription status with `plan_id`, `status: "active"`, and `current_period_end`
4. IF the user has no subscription with status `'cancelling'`, THEN THE Reactivate_Endpoint SHALL return HTTP 400 with error code `NO_CANCELLING_SUBSCRIPTION`
5. IF the Stripe API call fails, THEN THE Reactivate_Endpoint SHALL return HTTP 502 with error code `BILLING_STRIPE_ERROR` and not modify the database

### Requirement 11: Frontend Billing Client Reactivation Method

**User Story:** As a developer, I want a typed billing client method for reactivation, so that the frontend can call the reactivation endpoint in a consistent manner.

#### Acceptance Criteria

1. THE Billing_Client SHALL expose a `reactivateSubscription()` method that sends a POST request to `/api/billing/reactivate` with the user's auth token
2. WHEN the reactivation call succeeds, THE Billing_Client SHALL return a typed response containing `plan_id`, `status`, and `current_period_end`
3. IF the reactivation call fails, THEN THE Billing_Client SHALL throw an error with the server's error message

### Requirement 12: Internationalization

**User Story:** As a user, I want all text in the ending subscription view to be localized in my chosen language (Czech or English), so that I can understand the information regardless of locale.

#### Acceptance Criteria

1. THE Pricing_Page SHALL use the `tx()` i18n helper for all visible text in the ending subscription view
2. THE Pricing_Page SHALL include translation keys for both English and Czech locales covering: banner text, header, countdown labels, plan card labels, reactivation card text, modal content, usage stats labels, and "what happens after" items
3. WHEN the locale is switched while viewing the ending subscription view, THE Pricing_Page SHALL immediately re-render all text in the new locale without page reload

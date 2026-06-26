# Requirements Document

## Introduction

This feature redesigns the `/pricing` page in the MetaCleaner app (SvelteKit 2 + Svelte 5) to support subscription management for users who already have an active subscription. Non-subscribers continue to see the existing plan selection grid. Active subscribers see their current plan details, credit usage, upgrade/downgrade options, and cancellation controls. The feature requires new backend endpoints for plan changes and cancellation, confirmation modals for all destructive actions, and full localization in Czech and English.

## Glossary

- **Pricing_Page**: The SvelteKit route at `/pricing` that displays either the plan selection grid (for non-subscribers) or the subscription management UI (for active subscribers)
- **Subscription_Management_UI**: The interface shown to active subscribers containing current plan details, upgrade/downgrade cards, cancel section, and usage stats
- **Current_Plan_Card**: A component displaying the subscriber's active plan name, price, credit usage progress bar, included features, and billing information
- **Upgrade_Card**: A component presenting the next higher plan with additional features gained and the new price
- **Downgrade_Card**: A component presenting the next lower plan with features lost and the new price
- **Cancel_Section**: A component allowing users to initiate subscription cancellation with clear consequence warnings
- **Confirmation_Modal**: A dialog requiring explicit user confirmation before executing upgrade, downgrade, or cancellation actions
- **Bottom_Sheet**: A mobile-specific modal variant that slides up from the bottom of the viewport
- **Credit_Usage_Bar**: A progress bar visualizing the ratio of credits used to total monthly allowance
- **Billing_Client**: The frontend HTTP client module (`billingClient.ts`) responsible for communicating with backend billing endpoints
- **Billing_Store**: The reactive Svelte 5 store (`billingStore.svelte.ts`) managing subscription and credit state
- **Backend_API**: The Go HTTP server at `backend/metacleaner-server/` handling billing operations via Stripe
- **Proration**: The prorated cost difference when upgrading mid-billing-cycle, calculated by Stripe
- **Billing_Period**: The subscription interval, either `monthly` or `yearly`

## Requirements

### Requirement 1: Conditional Page Rendering

**User Story:** As a user visiting the pricing page, I want to see the appropriate interface for my subscription state, so that I can either choose a plan or manage my existing subscription.

#### Acceptance Criteria

1. WHEN a user with no active subscription (Billing_Store planStatus is "free") navigates to the Pricing_Page, THE Pricing_Page SHALL render the plan selection grid with billing toggle and plan cards
2. WHEN a user with an active subscription (Billing_Store planStatus is "active" or "trialing") navigates to the Pricing_Page, THE Pricing_Page SHALL render the Subscription_Management_UI displaying the current plan name, billing period, credits remaining, and current_period_end date
3. WHILE the Billing_Store isLoading is true and subscription data has not yet been retrieved, THE Pricing_Page SHALL display a skeleton loading state matching the Subscription_Management_UI layout dimensions within 100ms of navigation
4. WHEN a user with a cancelled subscription (Billing_Store planStatus is "cancelled") and a current_period_end date in the future navigates to the Pricing_Page, THE Pricing_Page SHALL render the Subscription_Management_UI with a cancellation notice displaying the current_period_end date as the access end date
5. IF the Billing_Store refresh fails (hasError is true) while loading subscription data, THEN THE Pricing_Page SHALL display an inline error message indicating the subscription status could not be loaded and provide a retry action to re-fetch the data

### Requirement 2: Current Plan Display

**User Story:** As a subscriber, I want to see my current plan details at a glance, so that I understand what I am paying for and how much of my allowance I have used.

#### Acceptance Criteria

1. THE Current_Plan_Card SHALL display the active plan name (Free, Pro, or Pro+), the monthly or yearly price in locale-appropriate currency format (English: "€X.XX/month" or "€X.XX/year"; Czech: "X,XX €/měsíc" or "X,XX €/rok"), and the billing period (monthly or yearly)
2. THE Current_Plan_Card SHALL display the Credit_Usage_Bar showing the ratio of credits used to the monthly allowance as a percentage-width progress bar, where the fill width equals Math.min(used / allowance, 1) × 100% clamped to the range [0%, 100%], and where the bar displays as empty (0% width) when the monthly allowance is 0
3. THE Current_Plan_Card SHALL display a text summary showing credits used, credits remaining, and the date credits renew formatted in the user's locale (English: "MMM D, YYYY"; Czech: "D. M. YYYY")
4. THE Current_Plan_Card SHALL display a list of features included in the active plan, sourced from the plan configuration data (PLAN_CONFIG)
5. THE Current_Plan_Card SHALL display billing information including the payment method type and last 4 digits (e.g., "Visa •••• 4242") and the next payment date formatted in the user's locale
6. WHEN the Billing_Store credits or subscription data changes, THE Current_Plan_Card SHALL reactively update all displayed values within the same render cycle without requiring a page reload
7. IF the user is on the Free plan with no active payment method, THEN THE Current_Plan_Card SHALL hide the billing information section (payment method and next payment date) and hide the price display, showing only the plan name, credit usage, and feature list
8. WHILE the subscription data is being fetched for the first time (no cached data exists), THE Current_Plan_Card SHALL display a skeleton placeholder matching the card dimensions instead of empty or partial content
9. IF the subscription or credit data fails to load, THEN THE Current_Plan_Card SHALL continue displaying the last known values and show a warning indicator to signal that the displayed data may be outdated

### Requirement 3: Upgrade Flow

**User Story:** As a subscriber on a lower plan, I want to upgrade to a higher plan with clear cost information, so that I can access additional features without confusion about pricing.

#### Acceptance Criteria

1. WHEN the active plan has a higher-tier plan available, THE Upgrade_Card SHALL display the next higher plan name, price, and a list of all features included in the target plan that are not included in the current plan
2. WHEN a user clicks the upgrade button on the Upgrade_Card, THE Pricing_Page SHALL open the upgrade Confirmation_Modal
3. THE upgrade Confirmation_Modal SHALL display the current plan name and price, the new plan name and price, and the prorated cost for the remainder of the current billing period
4. THE upgrade Confirmation_Modal SHALL display a message explaining that the upgrade takes effect immediately and state the next billing date and amount
5. THE upgrade Confirmation_Modal SHALL provide a cancel button that closes the modal without initiating any plan change
6. WHEN a user clicks the confirm button in the Confirmation_Modal, THE Billing_Client SHALL send a plan change request to the Backend_API and THE confirm button SHALL display a loading state and be disabled to prevent duplicate submissions until the request completes or fails
7. WHEN the Backend_API returns a successful upgrade response, THE Billing_Store SHALL refresh subscription and credit data and THE Pricing_Page SHALL update the Current_Plan_Card to show the new plan name, price, and features, and THE Upgrade_Card SHALL either display the next available upgrade or be removed if no higher plan exists
8. IF the Backend_API returns an error during the upgrade request, THEN THE Confirmation_Modal SHALL display a localized error message below the action buttons and remain open for retry
9. WHEN the user is on the highest available plan (Pro+), THE Upgrade_Card SHALL NOT be rendered

### Requirement 4: Downgrade Flow

**User Story:** As a subscriber on a higher plan, I want to downgrade to a lower plan with clear warnings about feature loss, so that I can reduce my costs while understanding the trade-offs.

#### Acceptance Criteria

1. WHEN the active plan has a lower-tier paid plan available, THE Downgrade_Card SHALL display the next lower plan name, price, and features the user will lose compared to their current plan
2. WHEN a user clicks the downgrade button on the Downgrade_Card, THE Pricing_Page SHALL open the downgrade Confirmation_Modal
3. THE downgrade Confirmation_Modal SHALL list the specific features the user will lose after the downgrade, shown with visual indicators (red cross icons)
4. THE downgrade Confirmation_Modal SHALL display a message explaining that the downgrade takes effect at the end of the current billing period and that the user retains full access until that date
5. THE downgrade Confirmation_Modal SHALL provide a cancel button that closes the modal without initiating any plan change
6. WHEN a user clicks the confirm button in the Confirmation_Modal, THE Billing_Client SHALL send a plan change request to the Backend_API and THE confirm button SHALL display a loading state and be disabled to prevent duplicate submissions until the request completes or fails
7. WHEN the Backend_API returns a successful downgrade response, THE Billing_Store SHALL refresh subscription data and THE Pricing_Page SHALL display a confirmation that the downgrade is scheduled with the effective date
8. IF the Backend_API returns an error during the downgrade request, THEN THE Confirmation_Modal SHALL display a localized error message below the action buttons and remain open for retry
9. WHEN the user is on the lowest paid plan (Pro), THE Downgrade_Card SHALL NOT be rendered since the only lower option is the free plan which is handled by cancellation

### Requirement 5: Subscription Cancellation

**User Story:** As a subscriber, I want to cancel my subscription with clear understanding of consequences, so that I can stop paying while knowing what happens to my account.

#### Acceptance Criteria

1. WHILE the user has an active or trialing subscription (status "active" or "trialing" with plan_id "pro" or "proplus"), THE Cancel_Section SHALL be displayed on the Pricing_Page with a warning message explaining that after cancellation the user retains access until the end of the paid period and then reverts to the free plan (3 photos per month, no reports access)
2. WHEN a user clicks the cancel button in the Cancel_Section, THE Pricing_Page SHALL open the cancellation Confirmation_Modal
3. THE cancellation Confirmation_Modal SHALL display a warning stating the user will be moved to the free plan (3 photos) after the current period ends and that remaining credits are forfeited
4. THE cancellation Confirmation_Modal SHALL display the access end date formatted as a localized date string (English: "MMM D, YYYY", Czech: "D. M. YYYY") and the number of remaining credits that will be lost
5. THE cancellation Confirmation_Modal SHALL provide two action buttons: a secondary-styled button to confirm cancellation and a primary-styled button (filled, higher visual prominence) to keep the current plan, encouraging the user to retain their subscription
6. WHEN a user confirms cancellation in the Confirmation_Modal, THE Billing_Client SHALL send a cancellation request to the Backend_API and THE Confirmation_Modal SHALL disable both action buttons and display a loading indicator on the confirm button until a response is received or a timeout of 15 seconds elapses
7. WHEN the Backend_API returns a successful cancellation response, THE Billing_Store SHALL refresh subscription data and THE Pricing_Page SHALL display the updated cancelled status with the access end date shown as a localized date string
8. IF the Backend_API returns an error during the cancellation request, THEN THE Confirmation_Modal SHALL display a localized error message indicating the cancellation could not be processed, re-enable both action buttons, and remain open for retry
9. WHILE the user is on the Free plan or has an already-cancelled subscription (status "cancelled" or "free"), THE Cancel_Section SHALL NOT be displayed on the Pricing_Page

### Requirement 6: Usage Statistics

**User Story:** As a subscriber, I want to see an overview of my credit usage, so that I can track how much of my monthly allowance I have consumed.

#### Acceptance Criteria

1. THE Subscription_Management_UI SHALL display a usage statistics section showing: credits consumed this period (calculated as monthly allowance minus remaining subscription credits, minimum 0), credits remaining (subscription_credits + purchased_credits), total monthly allowance (as defined by the user's plan: Free = 3, Pro = 100, Pro+ = 300), and the next renewal date (from current_period_end, formatted in the user's locale as a date without time)
2. WHEN the Billing_Store credit data updates, THE usage statistics section SHALL re-render with the updated values within the same reactive cycle without requiring a page reload
3. WHILE the billing data is being fetched for the first time (no cached values exist), THE usage statistics section SHALL display a skeleton placeholder matching the section layout dimensions
4. IF the billing data fails to load from the backend, THEN THE usage statistics section SHALL display the last known cached values with a warning indicator, or if no cached values exist, display a localized error message indicating that usage data is temporarily unavailable

### Requirement 7: Responsive Layout

**User Story:** As a user on any device, I want the subscription management page to adapt to my screen size, so that I can manage my subscription comfortably on desktop or mobile.

#### Acceptance Criteria

1. WHILE the viewport width is at or above the `lg` breakpoint (1024px), THE Subscription_Management_UI SHALL render in a two-column grid layout with the Current_Plan_Card and Cancel_Section in the left column (3/5 width) and the Upgrade_Card, Downgrade_Card, and usage statistics in the right column (2/5 width), separated by a gap of 24px
2. WHILE the viewport width is below the `lg` breakpoint, THE Subscription_Management_UI SHALL render in a single-column stacked layout with sections ordered top-to-bottom: Current_Plan_Card, Upgrade_Card, Downgrade_Card, usage statistics, Cancel_Section, separated by a vertical gap of 16px
3. WHILE the viewport width is below the `lg` breakpoint, THE Confirmation_Modal SHALL render as a Bottom_Sheet sliding up from the bottom of the viewport with a top border-radius of 16px, a semi-transparent backdrop overlay, and a slide-up animation duration of 300ms ease; WHEN the user taps the backdrop area outside the Bottom_Sheet, THE Confirmation_Modal SHALL close
4. WHILE the viewport width is at or above the `lg` breakpoint, THE Confirmation_Modal SHALL render as a vertically and horizontally centered dialog overlay with a maximum width of 480px, a semi-transparent backdrop overlay, and a fade-in animation duration of 200ms ease; WHEN the user clicks the backdrop area outside the dialog, THE Confirmation_Modal SHALL close

### Requirement 8: Backend Plan Change Endpoint

**User Story:** As the frontend application, I want a backend endpoint to change a user's subscription plan, so that upgrade and downgrade requests can be processed through Stripe.

#### Acceptance Criteria

1. WHEN the Backend_API receives a POST request to `/api/billing/change-plan` with a valid authentication token (JWT via Authorization header or API key via X-API-Key header) and a body containing `plan_id` (one of "pro", "proplus") and `billing_period` (one of "monthly", "yearly"), THE Backend_API SHALL initiate the plan change via Stripe and return HTTP 200 with a JSON response containing the updated plan details
2. WHEN the target plan has a higher price than the user's current plan (e.g., "pro" to "proplus"), THE Backend_API SHALL instruct Stripe to apply the change immediately with proration and return a response containing the prorated amount, the new plan_id, and the new billing_period
3. WHEN the target plan has a lower price than the user's current plan (e.g., "proplus" to "pro"), THE Backend_API SHALL instruct Stripe to schedule the change at the end of the current billing period and return a response containing the scheduled change date as an ISO 8601 timestamp
4. IF the request body is missing `plan_id` or `billing_period`, or `plan_id` is not one of the valid plan identifiers, or `billing_period` is not "monthly" or "yearly", THEN THE Backend_API SHALL return HTTP 400 with an error response in the standard ErrorResponse JSON format
5. IF the user does not have an active subscription, THEN THE Backend_API SHALL return HTTP 400 with error code "NO_ACTIVE_SUBSCRIPTION"
6. IF the user requests a change to the same plan_id and billing_period they currently hold, THEN THE Backend_API SHALL return HTTP 409 with error code "BILLING_CONFLICT" indicating no change is needed
7. IF the Stripe API call fails or is unreachable, THEN THE Backend_API SHALL return HTTP 502 with error code "BILLING_STRIPE_ERROR" and an error message indicating the plan change could not be processed

### Requirement 9: Backend Cancellation Endpoint

**User Story:** As the frontend application, I want a backend endpoint to cancel a user's subscription, so that cancellation requests are properly handled through Stripe.

#### Acceptance Criteria

1. WHEN the Backend_API receives a POST request to `/api/billing/cancel` with a valid JWT, THE Backend_API SHALL set the user's Stripe subscription to cancel at the end of the current billing period and update the subscription status in the database to "cancelling"
2. WHEN the Stripe cancellation request succeeds, THE Backend_API SHALL return HTTP 200 with a JSON response containing the `current_period_end` field as an ISO 8601 timestamp indicating when access expires
3. IF the user does not have an active subscription to cancel, THEN THE Backend_API SHALL return HTTP 400 with error code "NO_ACTIVE_SUBSCRIPTION"
4. IF the subscription is already scheduled for cancellation, THEN THE Backend_API SHALL return HTTP 400 with error code "ALREADY_CANCELLED"
5. IF the Stripe API call to cancel the subscription fails, THEN THE Backend_API SHALL return HTTP 502 with error code "BILLING_STRIPE_ERROR" and leave the subscription status unchanged

### Requirement 10: Localization

**User Story:** As a user of the MetaCleaner app, I want all subscription management text to be available in my language, so that I can understand plan details and actions in Czech or English.

#### Acceptance Criteria

1. THE Subscription_Management_UI SHALL display all labels, descriptions, feature names, button text, modal content, warning messages, and error messages using translation keys resolved by Paraglide, such that no raw translation key strings or empty content are visible to the user
2. THE Subscription_Management_UI SHALL render monetary amounts using the Euro symbol (€) with locale-appropriate formatting — English: symbol before the amount with period as decimal separator (e.g., €2.99), Czech: amount before the symbol with comma as decimal separator (e.g., 2,99 €)
3. THE Subscription_Management_UI SHALL render dates in a locale-appropriate format — Czech: day.month.year with dot separators (e.g., 15.06.2025), English: month/day/year with slash separators (e.g., 06/15/2025)
4. THE Subscription_Management_UI SHALL keep plan names (Free, Pro, Pro+) in English in both locales as untranslated brand identifiers
5. IF a translation key used by the Subscription_Management_UI is missing from the active locale's message file, THEN THE Subscription_Management_UI SHALL display the English fallback value for that key instead of rendering a raw key string or empty content

### Requirement 11: Component Architecture

**User Story:** As a developer, I want the subscription management UI to be split into focused components in the shared sections directory, so that the codebase remains maintainable and consistent with the project architecture.

#### Acceptance Criteria

1. THE Subscription_Management_UI SHALL be composed of separate Svelte 5 components for: Current_Plan_Card, Upgrade_Card, Downgrade_Card, Cancel_Section, Usage_Stats_Card, and Confirmation_Modal
2. THE subscription management section components SHALL be placed in `src/lib/shared/sections/` following the existing project component hierarchy
3. THE Confirmation_Modal component SHALL accept props for: a title (string), a content snippet (Svelte snippet via render prop), a confirm action callback, and a cancel action callback, to support all three modal variants (upgrade, downgrade, cancel)
4. IF Billing_Store property `isPaidPlan` is true, THEN THE Pricing_Page route component SHALL render the Subscription_Management_UI instead of the plan selection grid
5. IF Billing_Store property `isPaidPlan` is false, THEN THE Pricing_Page route component SHALL render the plan selection grid
6. WHILE Billing_Store property `isLoading` is true and Billing_Store property `credits` is null, THE Pricing_Page route component SHALL render a skeleton loading state instead of either view

### Requirement 12: Frontend API Client Extension

**User Story:** As the frontend application, I want the billing client to support plan change and cancellation API calls, so that the UI can communicate with the new backend endpoints.

#### Acceptance Criteria

1. THE Billing_Client SHALL expose a `changePlan` method that accepts `plan_id` (string) and `billing_period` (`'monthly' | 'yearly'`) parameters, includes the user's Bearer authentication token in the request header, sends a POST request to `/api/billing/change-plan`, and returns the updated `SubscriptionStatus` object on success
2. THE Billing_Client SHALL expose a `cancelSubscription` method that includes the user's Bearer authentication token in the request header, sends a POST request to `/api/billing/cancel`, and returns the updated `SubscriptionStatus` object on success
3. IF either method receives an HTTP response with a status code outside the 200–299 range, THEN THE Billing_Client SHALL attempt to parse the response body as JSON, extract the `message` field, and throw an error containing that message
4. IF the error response body cannot be parsed as JSON or does not contain a `message` field, THEN THE Billing_Client SHALL throw an error containing the HTTP status text as the error message

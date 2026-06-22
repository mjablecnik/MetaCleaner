# Requirements Document

## Introduction

This feature adds Stripe-based payment support to MetaCleaner, covering three payment scenarios: one-time credit pack purchases, monthly subscriptions, and yearly subscriptions. It involves sharing the pricing page UI between metacleaner-web (marketing site) and metacleaner-app (main application) via a shared workspace package, implementing the Stripe Checkout flow for both subscription and one-time payment modes, handling purchase redirects from both the website and the app, and providing a local development testing setup using Stripe test mode. The goal is to minimize code duplication while providing a seamless purchase experience across all payment types.

## Glossary

- **Shared_Package**: A bun workspace package (`frontend/metacleaner-shared`) containing pricing UI components, types, and data shared between metacleaner-web and metacleaner-app
- **Pricing_Page**: The page displaying subscription plans, credit packs, billing toggle, and purchase CTAs — rendered identically in both web and app (only header/footer differ)
- **Stripe_Checkout**: Stripe's hosted payment page where users complete their purchase
- **Checkout_Session**: A server-side Stripe object representing a single payment attempt, created via the backend API
- **Subscription**: A recurring Stripe subscription (monthly or yearly) tied to a user account, granting a monthly credit allowance (100 credits per billing cycle) that renews each period
- **Credit_Pack**: A one-time purchase of a fixed number of processing credits (e.g., 50 photos for €4) that never expire
- **Credit_Balance**: The total number of remaining credits a user has available for file processing (subscription credits plus purchased credits, tracked separately)
- **Credit_Transaction**: A record of credits added (subscription renewal or one-time purchase) or deducted (file processing) for audit purposes
- **Subscription_Credits**: Credits granted automatically at the start of each billing cycle as part of an active subscription (100 credits/month); unused subscription credits are reset (not accumulated) at the start of the next billing cycle
- **Purchased_Credits**: Credits obtained via one-time Credit_Pack purchase; these never expire and are always available regardless of subscription status
- **App**: The metacleaner-app SvelteKit application (authenticated users)
- **Website**: The metacleaner-web marketing site (unauthenticated visitors)
- **Backend**: The metacleaner-server Go service handling Stripe API calls, webhooks, and credit management
- **Webhook_Handler**: A backend endpoint receiving Stripe event notifications (payment success, subscription changes)
- **Auth_Guard**: The existing mechanism in metacleaner-app that redirects unauthenticated users to the login page
- **Stripe_Test_Mode**: Stripe's sandbox environment using test API keys (pk_test_*, sk_test_*) and test card numbers for local development
- **Stripe_CLI**: Stripe's command-line tool used to forward webhook events from Stripe to a local development server

## Requirements

### Requirement 1: Shared Pricing Package

**User Story:** As a developer, I want pricing page components shared between metacleaner-web and metacleaner-app via a workspace package, so that I avoid code duplication and ensure visual consistency.

#### Acceptance Criteria

1. THE Shared_Package SHALL export all pricing UI components (PricingCard, BillingToggle, EnterpriseBanner, PricingHeaderSection, PricingPlansSection) as Svelte 5 components
2. THE Shared_Package SHALL export pricing data types (Plan, EnterprisePlan, CreditPack) and data factory functions (pricingRepository, getEnterprise, getPlanPrice, getCreditPacks)
3. THE Shared_Package SHALL accept an `onPlanSelect` callback prop on PricingPlansSection to allow each consuming project to define its own CTA behavior for both subscriptions and credit packs
4. THE Pricing_Page SHALL always render identically to the current metacleaner-web pricing page regardless of whether the Shared_Package migration has been completed — visual parity is required at every stage of the migration
5. WHEN metacleaner-app imports components from the Shared_Package, THE Pricing_Page SHALL render identically to the metacleaner-web pricing page (excluding header/footer)
6. THE Shared_Package SHALL use the same i18n pattern (translation key-based) so that each consuming project resolves translations via its own Paraglide instance

### Requirement 2: Pricing Page in App

**User Story:** As a logged-in user, I want to see a pricing page in the app showing both subscription plans and credit packs, so that I can choose the payment option that suits my needs.

#### Acceptance Criteria

1. THE App SHALL display a pricing page at the `/pricing` route accessible from the main navigation
2. THE Pricing_Page in the App SHALL use the app's own header (NavBar) and footer, not the website header/footer
3. THE Pricing_Page SHALL display all available plans (monthly subscription with 100 credits/month, yearly subscription with 100 credits/month, credit pack) with monthly/yearly billing toggle for subscriptions
4. THE Pricing_Page SHALL display the Credit_Pack option (50 photos for €4, credits never expire) alongside subscription plans
5. WHILE the user has an active subscription, THE Pricing_Page SHALL indicate the user's current plan visually (e.g., "Current Plan" badge instead of CTA button)
6. THE Pricing_Page SHALL display the user's current Credit_Balance prominently regardless of subscription status
7. WHEN the user selects a subscription plan on the Pricing_Page, THE App SHALL initiate the Stripe Checkout flow in subscription mode; THE Pricing_Page SHALL prevent simultaneous selection of a subscription plan and a credit pack
8. WHEN the user selects the Credit_Pack on the Pricing_Page, THE App SHALL initiate the Stripe Checkout flow in one-time payment mode; THE Pricing_Page SHALL prevent simultaneous selection of a credit pack and a subscription plan

### Requirement 3: Stripe Checkout Flow from App (Subscription)

**User Story:** As a logged-in user in the app, I want to purchase a monthly or yearly subscription via Stripe, so that I receive 100 credits per month for file processing.

#### Acceptance Criteria

1. WHEN the user clicks a subscription plan's CTA button on the Pricing_Page, THE App SHALL send a request to the Backend to create a Checkout_Session with mode "subscription"
2. WHEN the Backend creates a subscription Checkout_Session, THE Backend SHALL include the user's ID, selected plan ID, and billing period (monthly/yearly) in the session metadata
3. WHEN the Checkout_Session is created successfully, THE App SHALL redirect the user to the Stripe_Checkout URL
4. WHEN Stripe completes the subscription payment successfully, THE Stripe_Checkout SHALL redirect the user back to the App at a success URL (e.g., `/pricing/success`)
5. WHEN the user cancels the payment on Stripe_Checkout, THE Stripe_Checkout SHALL redirect the user back to the App at a cancel URL (e.g., `/pricing`)
6. IF the Checkout_Session creation fails, THEN THE App SHALL display an inline error message on the Pricing_Page

### Requirement 4: Stripe Checkout Flow from App (Credit Pack)

**User Story:** As a logged-in user in the app, I want to purchase a credit pack via a one-time Stripe payment, so that I can process files without committing to a subscription.

#### Acceptance Criteria

1. WHEN the user clicks the Credit_Pack CTA button on the Pricing_Page, THE App SHALL send a request to the Backend to create a Checkout_Session with mode "payment"
2. WHEN the Backend creates a payment Checkout_Session, THE Backend SHALL include the user's ID, credit pack ID, and credit amount in the session metadata
3. WHEN the Checkout_Session is created successfully, THE App SHALL redirect the user to the Stripe_Checkout URL
4. WHEN Stripe completes the one-time payment successfully, THE Stripe_Checkout SHALL redirect the user back to the App at a success URL (e.g., `/pricing/success?type=credits`)
5. WHEN the user cancels the payment on Stripe_Checkout, THE Stripe_Checkout SHALL redirect the user back to the App at a cancel URL (e.g., `/pricing`)
6. IF the Checkout_Session creation fails, THEN THE App SHALL display an inline error message on the Pricing_Page

### Requirement 5: Stripe Checkout Flow from Website

**User Story:** As a visitor on the marketing website, I want to start a purchase from the pricing page, so that I can subscribe to MetaCleaner or buy credits.

#### Acceptance Criteria

1. WHEN a visitor clicks a plan's CTA button (subscription or credit pack) on the Website Pricing_Page, THE Website SHALL redirect the visitor to the App's pricing page with the selected plan ID as a query parameter (e.g., `/pricing?plan=pro&billing=yearly` or `/pricing?plan=credits`)
2. WHEN the App receives a redirect with a plan query parameter, THE Auth_Guard SHALL ensure the user is authenticated before proceeding
3. WHEN the user is not authenticated and a plan query parameter is present, THE App SHALL redirect to the login page and preserve the plan selection for after login
4. WHEN the user completes authentication with a pending plan selection, THE App SHALL automatically initiate the Stripe Checkout flow for the preserved plan

### Requirement 6: Backend Checkout Session API

**User Story:** As the app frontend, I want a backend endpoint to create Stripe Checkout Sessions for both subscriptions and one-time payments, so that payment processing is handled securely server-side.

#### Acceptance Criteria

1. THE Backend SHALL expose a `POST /api/billing/checkout` endpoint that creates a Stripe Checkout_Session
2. THE Backend SHALL require a valid authentication token for the checkout endpoint
3. WHEN the checkout endpoint receives a request with mode "subscription", THE Backend SHALL validate that the request contains a valid plan ID and billing period (monthly or yearly)
4. WHEN the checkout endpoint receives a request with mode "payment", THE Backend SHALL validate that the request contains a valid credit pack ID
5. WHEN the checkout endpoint creates a subscription session, THE Backend SHALL validate that the Stripe Checkout mode matches "subscription" before sending the request to Stripe, and SHALL set the corresponding recurring Price ID
6. WHEN the checkout endpoint creates a credit pack session, THE Backend SHALL validate that the Stripe Checkout mode matches "payment" before sending the request to Stripe, and SHALL set the corresponding one-time Price ID
7. WHEN the checkout endpoint creates a session, THE Backend SHALL set the Stripe customer to match the authenticated user (creating a Stripe customer if one does not exist)
8. THE Backend SHALL store the mapping between Supabase user ID and Stripe customer ID in the database
9. IF the user already has an active subscription for the requested plan, THEN THE Backend SHALL reject the subscription request with a descriptive error

### Requirement 7: Stripe Webhook Processing

**User Story:** As the system, I want to process Stripe webhook events for both subscription changes and one-time payments, so that subscription status and credit balances are kept in sync with Stripe.

#### Acceptance Criteria

1. THE Backend SHALL expose a `POST /api/billing/webhook` endpoint that receives Stripe webhook events
2. THE Backend SHALL verify the Stripe webhook signature on every incoming event before processing
3. WHEN a `checkout.session.completed` event with mode "subscription" is received, THE Webhook_Handler SHALL activate the user's subscription in the database and set the user's Subscription_Credits to 100
4. WHEN a `checkout.session.completed` event with mode "payment" is received, THE Webhook_Handler SHALL add the purchased credits to the user's Purchased_Credits and record a Credit_Transaction of type "purchase"
5. WHEN an `invoice.paid` event is received for a subscription renewal (not the initial payment), THE Webhook_Handler SHALL reset the user's Subscription_Credits to 100 and record a Credit_Transaction of type "subscription_renewal"
6. WHEN a `customer.subscription.updated` event is received, THE Webhook_Handler SHALL update the subscription status and plan in the database
7. WHEN a `customer.subscription.deleted` event is received, THE Webhook_Handler SHALL mark the subscription as cancelled in the database
8. WHEN an `invoice.payment_failed` event is received, THE Webhook_Handler SHALL mark the subscription as past_due in the database
9. IF webhook signature verification fails, THEN THE Backend SHALL reject the entire request with HTTP 400 and SHALL NOT process any webhook events from that request

### Requirement 8: Credit Balance Management

**User Story:** As a logged-in user, I want my credit balance tracked accurately across subscription renewals and credit pack purchases, so that I know how many files I can still process.

#### Acceptance Criteria

1. THE Backend SHALL maintain two separate credit counters per user: Subscription_Credits (resets each billing cycle) and Purchased_Credits (never expire)
2. THE Backend SHALL calculate the effective Credit_Balance as the sum of Subscription_Credits and Purchased_Credits
3. WHEN a credit pack purchase is confirmed via webhook, THE Backend SHALL increase the user's Purchased_Credits by the number of credits in the pack (e.g., 50) and record a Credit_Transaction of type "purchase"
4. WHEN a subscription billing cycle starts (detected via `invoice.paid` webhook event), THE Backend SHALL reset the user's Subscription_Credits to 100 (replacing any unused amount from the previous cycle) and record a Credit_Transaction of type "subscription_renewal"
5. WHEN a user processes a file via the cleaning job system, THE Backend SHALL deduct one credit per file processed — deducting from Subscription_Credits first, then from Purchased_Credits when Subscription_Credits reach zero
6. IF a user has zero effective Credit_Balance (both Subscription_Credits and Purchased_Credits are zero), THEN THE Backend SHALL reject file processing requests with a descriptive error indicating insufficient credits and suggesting a credit pack purchase or subscription upgrade
7. THE Backend SHALL record every non-zero credit addition and deduction as a Credit_Transaction with timestamp, amount, type (purchase, subscription_renewal, or usage), credit_source (subscription or purchased), and reference ID (checkout session ID, invoice ID, or job ID); zero-amount transactions SHALL be skipped
8. THE Backend SHALL expose a `GET /api/billing/credits` endpoint that returns the user's current Subscription_Credits, Purchased_Credits, total Credit_Balance, and recent Credit_Transaction history
9. THE Purchased_Credits SHALL never expire regardless of subscription status or time elapsed
10. WHEN a subscription is cancelled or expires, THE Backend SHALL set Subscription_Credits to zero but SHALL preserve all Purchased_Credits

### Requirement 9: Subscription Status API

**User Story:** As a logged-in user, I want the app to know my subscription status and credit balance, so that I can see how many files I can still process.

#### Acceptance Criteria

1. THE Backend SHALL expose a `GET /api/billing/subscription` endpoint that returns the current user's subscription status
2. THE Backend SHALL require a valid authentication token for the subscription endpoint
3. WHEN the user has an active subscription, THE Backend SHALL return the plan ID, status, billing period, and current period end date
4. WHEN the user has no subscription, THE Backend SHALL return a response indicating the free plan
5. THE Backend SHALL include the user's current Subscription_Credits, Purchased_Credits, and total Credit_Balance in the subscription status response
6. THE App SHALL fetch the subscription status and credit balance on login and cache it in the client-side auth state
7. WHEN the subscription status or credit balance changes (after successful checkout redirect or file processing), THE App SHALL refresh the subscription status from the Backend

### Requirement 10: Database Schema for Subscriptions and Credits

**User Story:** As the system, I want subscription and credit data persisted in the database, so that user entitlements are durable and queryable.

#### Acceptance Criteria

1. THE Backend SHALL store subscription records with fields: user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, billing_period, current_period_start, current_period_end, created_at, updated_at
2. THE Backend SHALL store a user-to-stripe-customer mapping with fields: user_id, stripe_customer_id, created_at
3. THE Backend SHALL enforce a unique constraint on user_id in the stripe customers mapping (one Stripe customer per user)
4. THE Backend SHALL store credit balance records with fields: user_id, subscription_credits, purchased_credits, updated_at
5. THE Backend SHALL store credit transaction records with fields: user_id, amount (positive for additions, negative for deductions), type (purchase, subscription_renewal, or usage), credit_source (subscription or purchased), reference_id (checkout session ID, invoice ID, or job ID), description, created_at
6. THE Backend SHALL enforce that neither subscription_credits nor purchased_credits become negative (database CHECK constraints)
7. WHEN a subscription record is updated, THE Backend SHALL update the updated_at timestamp

### Requirement 11: Local Development Testing Setup

**User Story:** As a developer, I want to test the complete Stripe payment flow locally using Stripe test mode, so that I can develop and debug payment features without processing real payments.

#### Acceptance Criteria

1. THE Backend SHALL support running in Stripe_Test_Mode by accepting test API keys (sk_test_*) via the STRIPE_SECRET_KEY environment variable
2. THE Backend SHALL document Stripe test card numbers in the developer documentation (4242 4242 4242 4242 for successful payment, 4000 0000 0000 0002 for declined payment, 4000 0025 0000 3155 for 3D Secure authentication)
3. THE Backend SHALL support receiving webhooks forwarded by the Stripe_CLI to localhost during development
4. THE Backend SHALL document the Stripe CLI webhook forwarding command (`stripe listen --forward-to localhost:8080/api/billing/webhook`) in the developer setup instructions
5. WHEN running in Stripe_Test_Mode, THE Backend SHALL use the Stripe_CLI webhook signing secret (whsec_* from `stripe listen` output) as the STRIPE_WEBHOOK_SECRET environment variable
6. THE Backend SHALL include all Stripe-related environment variables (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO_MONTH, STRIPE_PRICE_PRO_YEAR, STRIPE_PRICE_CREDIT_PACK) in the .env.example file with descriptive comments indicating test vs production values
7. THE App SHALL actively use the Stripe test publishable key (pk_test_*) when running against Stripe_Test_Mode for any client-side Stripe.js integration
8. THE Backend SHALL log Stripe webhook events at info level during development to aid debugging


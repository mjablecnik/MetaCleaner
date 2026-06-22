# Implementation Tasks

## Task 1: Create Shared Pricing Package

- [x] 1.1 Create `frontend/metacleaner-shared/package.json` with name, svelte peer dependency, and exports config
- [x] 1.2 Create `frontend/metacleaner-shared/tsconfig.json` for TypeScript resolution
- [x] 1.3 Move pricing types (`Plan`, `EnterprisePlan`) and data functions (`pricingRepository`, `getEnterprise`, `getPlanPrice`) from `metacleaner-web/src/lib/repositories/pricing.ts` to `metacleaner-shared/src/data/pricing.ts`
- [x] 1.4 Create `metacleaner-shared/src/types/pricing.ts` exporting `Plan`, `EnterprisePlan` interfaces
- [x] 1.5 Move `BillingToggle.svelte` to `metacleaner-shared/src/components/BillingToggle.svelte` — refactor to accept `translate` prop instead of direct Paraglide import
- [x] 1.6 Move `PricingCard.svelte` to `metacleaner-shared/src/components/PricingCard.svelte` — refactor to accept `translate` and `translateParam` props, add `onSelect` callback and `isCurrent` prop
- [x] 1.7 Move `EnterpriseBanner.svelte` to `metacleaner-shared/src/components/EnterpriseBanner.svelte` — refactor to accept `translate` prop
- [x] 1.8 Move `PricingHeaderSection.svelte` to `metacleaner-shared/src/components/PricingHeaderSection.svelte` — refactor to accept `translate` prop
- [x] 1.9 Move `PricingPlansSection.svelte` to `metacleaner-shared/src/components/PricingPlansSection.svelte` — refactor to accept `translate`, `onPlanSelect`, and `currentPlanId` props
- [x] 1.10 Create `metacleaner-shared/src/index.ts` barrel export for all components, types, and data functions
- [x] 1.11 Add `"frontend/metacleaner-shared"` and `"frontend/metacleaner-web"` to root workspace `package.json` workspaces array
- [x] 1.12 Add `"metacleaner-shared": "workspace:*"` to metacleaner-web `package.json` dependencies and update imports in `src/routes/pricing/` to use the shared package
- [x] 1.13 Add `"metacleaner-shared": "workspace:*"` to metacleaner-app `package.json` dependencies
- [x] 1.14 Verify metacleaner-web pricing page still renders correctly after refactor (run `bun run check` in metacleaner-web)

## Task 2: Pricing Page in metacleaner-app

- [x] 2.1 Add pricing-related i18n keys to `metacleaner-app/messages/en.json` and `messages/cs.json` (copy from metacleaner-web messages)
- [x] 2.2 Create `src/routes/pricing/+page.svelte` in metacleaner-app — import shared components, wire up `translate` with app's `tx()`, handle query params (`?plan=...&billing=...`)
- [x] 2.3 Create `src/routes/pricing/+page.ts` — load function that checks auth and reads query params
- [x] 2.4 Create `src/routes/pricing/success/+page.svelte` — success page shown after Stripe checkout completion
- [x] 2.5 Add `/pricing` link to app's NavBar navigation items
- [x] 2.6 Implement auto-checkout trigger: when `?plan=` query param is present and user is authenticated, automatically initiate checkout flow
- [x] 2.7 Implement plan preservation across login: if unauthenticated user hits `/pricing?plan=X`, redirect to `/login?returnTo=/pricing?plan=X&billing=Y`

## Task 3: Frontend Billing Client

- [x] 3.1 Create `src/lib/clients/billingClient.ts` in metacleaner-app with `createCheckoutSession(planId, billing)` and `getSubscription()` methods
- [x] 3.2 Create `src/lib/types/billing.ts` with `SubscriptionStatus`, `CheckoutResponse` interfaces
- [x] 3.3 Add subscription status to auth state — fetch on login, expose `authStore.subscription` reactive property
- [x] 3.4 Wire pricing page to display current plan indicator based on subscription status

## Task 4: Backend Database Migration

- [x] 4.1 Create `scripts/migration004.sql` with `stripe_customers` table (user_id, stripe_customer_id, unique constraints, indexes)
- [x] 4.2 Add `subscriptions` table to migration (user_id, stripe_subscription_id, stripe_customer_id, plan_id, status, billing_period, period dates, timestamps, indexes)

## Task 5: Backend Stripe Configuration

- [x] 5.1 Add Stripe config fields to `Config` struct: `StripeSecretKey`, `StripeWebhookSecret`, Stripe Price IDs for each plan
- [x] 5.2 Load Stripe env vars in `LoadConfig()` with validation (StripeSecretKey required if billing endpoints are to be used)
- [x] 5.3 Add `stripe-go` dependency to `go.mod` (`github.com/stripe/stripe-go/v82`)
- [x] 5.4 Update `.env.example` with Stripe-related keys (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO_MONTH, etc.)

## Task 6: Backend Checkout Endpoint

- [x] 6.1 Create `source/billing_handlers.go` with `HandleCreateCheckout(cfg, db)` handler
- [x] 6.2 Implement Stripe customer lookup/creation logic — find existing mapping or create new Stripe customer with user's email
- [x] 6.3 Implement checkout session creation — map plan_id + billing_period to Stripe Price ID, create Checkout Session with success/cancel URLs
- [x] 6.4 Add validation: reject if user already has active subscription for the same plan (409 Conflict)
- [x] 6.5 Register `POST /api/billing/checkout` route in router (authenticated, rate-limited)

## Task 7: Backend Webhook Endpoint

- [x] 7.1 Create `source/billing_webhook.go` with `HandleStripeWebhook(cfg, db)` handler
- [x] 7.2 Implement Stripe signature verification using webhook secret
- [x] 7.3 Handle `checkout.session.completed` — create subscription record in database
- [x] 7.4 Handle `customer.subscription.updated` — update subscription status and plan details
- [x] 7.5 Handle `customer.subscription.deleted` — mark subscription as cancelled
- [x] 7.6 Handle `invoice.payment_failed` — mark subscription as past_due
- [x] 7.7 Register `POST /api/billing/webhook` route in router (no auth middleware — signature-verified)

## Task 8: Backend Subscription Status Endpoint

- [x] 8.1 Create `HandleGetSubscription(db)` handler in `billing_handlers.go`
- [x] 8.2 Implement subscription query — look up active subscription by user_id, return plan_id + status + period info
- [x] 8.3 Return free plan response when no subscription exists
- [x] 8.4 Register `GET /api/billing/subscription` route in router (authenticated)

## Task 9: Backend Supabase Client Extension

- [x] 9.1 Add Supabase DB methods: `GetStripeCustomer(userId)`, `CreateStripeCustomer(userId, stripeCustomerId)`
- [x] 9.2 Add Supabase DB methods: `CreateSubscription(sub)`, `UpdateSubscription(stripeSubId, fields)`, `GetSubscriptionByUserId(userId)`
- [x] 9.3 Add Supabase DB method: `GetSubscriptionByStripeId(stripeSubscriptionId)` for webhook processing

## Task 10: Website CTA Redirect

- [ ] 10.1 Update metacleaner-web pricing page to pass `onPlanSelect` callback that redirects to app URL with plan + billing query params
- [ ] 10.2 Add `PUBLIC_APP_URL` environment variable to metacleaner-web for configuring the app redirect target
- [ ] 10.3 Update metacleaner-web `.env.example` with `PUBLIC_APP_URL`


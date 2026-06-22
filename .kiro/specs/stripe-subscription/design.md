# Design Document

## Overview

This design describes the implementation of Stripe subscription support for MetaCleaner, including:
1. A shared pricing package in the bun workspace for component reuse between web and app
2. A pricing page in metacleaner-app with Stripe Checkout integration
3. Backend API endpoints for creating checkout sessions, processing webhooks, and querying subscription status
4. Database schema for storing subscription and Stripe customer data

## Architecture

### High-Level Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  metacleaner-web │     │  metacleaner-app  │     │ metacleaner-server│
│  (marketing)     │     │  (authenticated)  │     │  (Go backend)    │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ Pricing Page     │──→  │ /pricing?plan=X  │──→  │ POST /api/billing│
│ (CTA = redirect  │     │ (auth guard)      │     │   /checkout      │
│  to app)         │     │ Create checkout   │     │ Stripe API call  │
│                  │     │ Redirect to Stripe│     │                  │
│                  │     │                   │←──  │ POST /api/billing│
│                  │     │ /pricing/success  │     │   /webhook       │
│                  │     │ Show success      │     │ Process events   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │     Stripe       │
                                                  │  (Checkout +     │
                                                  │   Webhooks)      │
                                                  └──────────────────┘
```

### Shared Package Architecture

```
frontend/metacleaner-shared/
├── src/
│   ├── components/
│   │   ├── PricingCard.svelte
│   │   ├── BillingToggle.svelte
│   │   ├── EnterpriseBanner.svelte
│   │   ├── PricingHeaderSection.svelte
│   │   └── PricingPlansSection.svelte
│   ├── types/
│   │   └── pricing.ts          # Plan, EnterprisePlan interfaces
│   ├── data/
│   │   └── pricing.ts          # pricingRepository(), getEnterprise(), getPlanPrice()
│   └── index.ts                # Barrel export
├── package.json
└── tsconfig.json
```

## Design Decisions

### 1. Shared Package via Bun Workspace (not monorepo merge)

**Decision:** Create `frontend/metacleaner-shared` as a new workspace package.

**Rationale:**
- Already-proven pattern: metacleaner-cli links to metacleaner-app via `workspace:*`
- Web and app have fundamentally different deployment targets (static nginx vs Capacitor Android)
- Minimal surface area: only pricing components + types are shared
- Each project keeps its own Paraglide instance and i18n strategy
- No build step needed — SvelteKit resolves workspace packages at dev/build time

**Implementation:**
- Add `"frontend/metacleaner-shared"` to root `package.json` workspaces
- Both web and app add `"metacleaner-shared": "workspace:*"` to dependencies
- Components use translation key strings (not direct Paraglide imports) — each consumer resolves keys via its own i18n system

### 2. Translation Strategy for Shared Components

**Decision:** Shared components accept a `t` function prop (or use key-based rendering where the consumer passes resolved strings).

**Rationale:**
- metacleaner-web uses `$lib/i18n` with a `t(key)` helper
- metacleaner-app uses `tx(key)` with `void locale.current` pattern
- Paraglide generates project-specific runtime — cannot share it across packages

**Implementation:** The shared components accept a `translate: (key: string) => string` prop. Each consuming project passes its own `t`/`tx` function. For `$lib/paraglide/messages` direct calls (like `m.pricing_save({amount})`), the shared components accept pre-resolved strings or use a callback for parameterized messages.

### 3. Stripe Integration via Backend (not client-side)

**Decision:** All Stripe API calls happen server-side in the Go backend.

**Rationale:**
- Stripe secret key must never be exposed to the client
- Webhook signature verification requires the webhook secret
- Backend can associate Stripe customer with Supabase user securely
- Consistent with existing architecture pattern (frontend → backend → external service)

### 4. Stripe Checkout (not embedded Elements)

**Decision:** Use Stripe Checkout (hosted payment page) rather than Stripe Elements.

**Rationale:**
- Simpler integration (redirect-based, no PCI compliance concerns)
- Stripe handles the entire payment UI, localization, and 3DS
- Perfect for subscription model where the payment form is only used once (subscribe/change plan)
- Reduces frontend complexity significantly

### 5. CTA Behavior Differentiation

**Decision:** PricingPlansSection accepts an `onPlanSelect(planId, billing)` callback.

- **In metacleaner-web:** callback triggers `window.location.href` redirect to app URL with plan params
- **In metacleaner-app:** callback triggers the checkout session creation API call

## Detailed Design

### Component: frontend/metacleaner-shared

#### Package Configuration

```json
{
  "name": "metacleaner-shared",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "svelte": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*",
    "./types": "./src/types/pricing.ts",
    "./data": "./src/data/pricing.ts"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}
```

#### Shared Component Props Pattern

All shared pricing components accept a `translate` function instead of importing Paraglide directly:

```typescript
// PricingPlansSection.svelte
interface Props {
  plans: Plan[];
  isYearly: boolean;
  enterprise: EnterprisePlan;
  translate: (key: string) => string;
  translateParam?: (key: string, params: Record<string, string>) => string;
  onPlanSelect?: (planId: string, billing: 'monthly' | 'yearly') => void;
  currentPlanId?: string | null;  // highlights user's active plan
}
```

#### Data Layer (types + repository)

Moved from `metacleaner-web/src/lib/repositories/pricing.ts` to `metacleaner-shared/src/data/pricing.ts`. The data is static (hardcoded plan definitions) — no API calls needed.

### Component: metacleaner-app Pricing Page

#### Route: `/pricing`

```
frontend/metacleaner-app/src/routes/pricing/
├── +page.svelte              # Pricing page (imports shared components)
├── +page.ts                  # Load function (fetches subscription status)
└── success/
    └── +page.svelte          # Post-checkout success page
```

#### Page Logic

```typescript
// +page.svelte (simplified)
import { PricingHeaderSection, PricingPlansSection } from 'metacleaner-shared';
import { pricingRepository, getEnterprise } from 'metacleaner-shared/data';
import { tx } from '$lib/shared/utils/i18n';
import { authStore } from '$lib/auth/auth.svelte';
import { billingClient } from '$lib/clients/billingClient';

// State
let currentBilling = $state<'monthly' | 'yearly'>('monthly');
let subscriptionStatus = $state(null); // fetched on mount
let checkoutError = $state<string | null>(null);

// Handle plan selection → create checkout session
async function handlePlanSelect(planId: string, billing: 'monthly' | 'yearly') {
  const { url } = await billingClient.createCheckoutSession(planId, billing);
  window.location.href = url; // redirect to Stripe Checkout
}
```

#### Pending Plan from Website Redirect

When the app receives `/pricing?plan=pro&billing=yearly`:
1. Auth guard ensures user is logged in (redirects to `/login` with `returnTo=/pricing?plan=pro&billing=yearly`)
2. After login, user returns to `/pricing?plan=pro&billing=yearly`
3. The pricing page detects query params and auto-triggers `handlePlanSelect`

### Component: metacleaner-app Billing Client

```typescript
// src/lib/clients/billingClient.ts
import { buildApiUrl } from './api-config';
import { authStore } from '$lib/auth/auth.svelte';

export const billingClient = {
  async createCheckoutSession(planId: string, billing: 'monthly' | 'yearly') {
    const res = await fetch(buildApiUrl('/api/billing/checkout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({ plan_id: planId, billing_period: billing })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<{ url: string; session_id: string }>;
  },

  async getSubscription() {
    const res = await fetch(buildApiUrl('/api/billing/subscription'), {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<SubscriptionStatus>;
  }
};
```

### Component: metacleaner-web CTA Behavior

```typescript
// In metacleaner-web pricing page
function handlePlanSelect(planId: string, billing: 'monthly' | 'yearly') {
  const appUrl = 'https://app.metacleaner.com'; // from env or config
  window.location.href = `${appUrl}/pricing?plan=${planId}&billing=${billing}`;
}
```

### Component: Backend Billing Endpoints

#### Config Extension

```go
// Added to Config struct
type Config struct {
  // ... existing fields ...
  StripeSecretKey      string
  StripeWebhookSecret  string
  StripePriceProMonth  string  // Stripe Price ID for Pro monthly
  StripePriceProYear   string  // Stripe Price ID for Pro yearly
  StripePricePackOnce  string  // Stripe Price ID for Pack (one-time)
  // ... more price IDs as needed
}
```

#### Endpoint: POST /api/billing/checkout

**Request:**
```json
{
  "plan_id": "pro",
  "billing_period": "monthly"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_...",
  "session_id": "cs_..."
}
```

**Logic:**
1. Validate auth token (extract user ID)
2. Validate plan_id and billing_period
3. Look up or create Stripe customer for user
4. Map plan_id + billing_period to Stripe Price ID
5. Create Stripe Checkout Session with:
   - `customer`: Stripe customer ID
   - `mode`: "subscription" (or "payment" for one-time pack)
   - `line_items`: [{price: priceId, quantity: 1}]
   - `success_url`: `{frontend_url}/pricing/success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url`: `{frontend_url}/pricing`
   - `metadata`: {user_id, plan_id, billing_period}
6. Return checkout URL

#### Endpoint: POST /api/billing/webhook

**Logic:**
1. Read raw body
2. Verify Stripe signature using webhook secret
3. Parse event type and dispatch:
   - `checkout.session.completed` → Create/update subscription record
   - `customer.subscription.updated` → Update subscription status/plan
   - `customer.subscription.deleted` → Mark as cancelled
   - `invoice.payment_failed` → Mark as past_due
4. Return 200 OK (Stripe retries on non-2xx)

#### Endpoint: GET /api/billing/subscription

**Response (active subscription):**
```json
{
  "plan_id": "pro",
  "status": "active",
  "billing_period": "monthly",
  "current_period_end": "2025-02-15T00:00:00Z"
}
```

**Response (no subscription):**
```json
{
  "plan_id": "free",
  "status": "active",
  "billing_period": null,
  "current_period_end": null
}
```

### Component: Database Schema

#### Migration: stripe_customers table

```sql
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
```

#### Migration: subscriptions table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  billing_period TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);
```

**Status values:** `active`, `past_due`, `cancelled`, `incomplete`, `trialing`

### Route Registration (Backend)

```go
// In NewRouter():
// Billing endpoints (authenticated)
mux.Handle("POST /api/billing/checkout", HandleCreateCheckout(cfg, db))
mux.Handle("GET /api/billing/subscription", HandleGetSubscription(db))

// Webhook endpoint (no auth — verified by Stripe signature)
mux.Handle("POST /api/billing/webhook", HandleStripeWebhook(cfg, db))
```

## Workspace Configuration

Updated root `package.json`:
```json
{
  "name": "metacleaner-workspace",
  "private": true,
  "workspaces": [
    "frontend/metacleaner-app",
    "frontend/metacleaner-shared",
    "terminal/metacleaner-cli"
  ]
}
```

Both metacleaner-web and metacleaner-app add to their `package.json`:
```json
{
  "dependencies": {
    "metacleaner-shared": "workspace:*"
  }
}
```

**Note:** metacleaner-web is not currently in the workspace (it's standalone). Adding it to the workspace or using a relative path reference are both viable. Since it doesn't need to be linked by other packages (unlike metacleaner-app which is linked by CLI), the simplest approach is to add it to the workspace array as well.

## Security Considerations

- Stripe secret key stored only in backend `.env` (never in frontend)
- Webhook endpoint verifies Stripe signature before processing any event
- Checkout endpoint requires valid JWT — prevents unauthorized session creation
- Stripe customer creation is idempotent (check existing mapping before creating)
- No sensitive data (card numbers, etc.) touches our infrastructure — Stripe Checkout handles it all

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Checkout creation fails (Stripe API error) | Return 502 with descriptive error, frontend shows inline message |
| Webhook signature invalid | Return 400, log warning |
| Webhook event for unknown user | Log warning, return 200 (don't retry) |
| User already has active sub for same plan | Return 409 Conflict |
| Subscription fetch for unauthenticated user | Return 401 |
| Network error during checkout redirect | Frontend shows retry button |

## Correctness Properties

1. **Idempotent webhook processing:** Processing the same webhook event twice produces the same database state (upsert semantics on stripe_subscription_id)
2. **Customer mapping uniqueness:** A user always maps to exactly one Stripe customer (enforced by UNIQUE constraint)
3. **Subscription status consistency:** The subscription status in the database always reflects the latest Stripe event (events are processed in order via timestamp comparison)
4. **Checkout session isolation:** A checkout session is tied to exactly one user and one plan — no cross-user contamination
5. **Auth guard preservation:** Plan selection from website redirect is preserved across the login flow and executed after successful authentication


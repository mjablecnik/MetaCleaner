# Stripe Subscription — Missing Implementation Items

Audit of the stripe-subscription feature against the spec.
Items are ordered by priority (critical first).

**Spec files:**
- [Requirements](.kiro/specs/stripe-subscription/requirements.md)
- [Design](.kiro/specs/stripe-subscription/design.md)
- [Tasks](.kiro/specs/stripe-subscription/tasks.md)

---

## Critical — Payments won't work correctly without these

### 1. Webhook: Credit pack purchase does not add credits

**File:** `backend/metacleaner-server/source/billing_webhook.go`
**Problem:** `handleCheckoutSessionCompleted` returns `nil` for `mode == payment` without adding credits.
**Required:**
- When `checkout.session.completed` has `mode == "payment"`, read `credit_pack_id` / credit amount from session metadata
- Upsert `credit_balances` row: increment `purchased_credits` by pack amount (50)
- Insert a `credit_transactions` record with type=`purchase`, credit_source=`purchased`, reference_id=session ID
- Spec reference: Requirement 7 AC4, Requirement 8 AC3

### 2. Webhook: Subscription activation does not grant initial credits

**File:** `backend/metacleaner-server/source/billing_webhook.go`
**Problem:** `handleCheckoutSessionCompleted` creates subscription but never sets `subscription_credits = 100`.
**Required:**
- After `db.CreateSubscription(...)`, upsert `credit_balances` row: set `subscription_credits = 100`
- Insert a `credit_transactions` record with type=`subscription_renewal`, credit_source=`subscription`, reference_id=session ID
- Spec reference: Requirement 7 AC3, Requirement 8 AC4

### 3. Webhook: `invoice.paid` event not handled (subscription renewal)

**File:** `backend/metacleaner-server/source/billing_webhook.go`
**Problem:** No case for `"invoice.paid"` in the event switch. Without this, credits never reset each billing cycle.
**Required:**
- Add `case "invoice.paid"` to the switch
- Distinguish initial invoice (skip — handled by checkout.session.completed) vs renewal invoice
- On renewal: reset `subscription_credits = 100` in `credit_balances`
- Insert a `credit_transactions` record with type=`subscription_renewal`, credit_source=`subscription`, reference_id=invoice ID
- Spec reference: Requirement 7 AC5, Requirement 8 AC4

### 4. Webhook: Subscription deletion does not zero subscription credits

**File:** `backend/metacleaner-server/source/billing_webhook.go`
**Problem:** `handleSubscriptionDeleted` only sets status to `"cancelled"` but leaves `subscription_credits` untouched.
**Required:**
- After updating subscription status, set `subscription_credits = 0` in `credit_balances` for the user
- Spec reference: Requirement 8 AC10

### 5. Missing Supabase DB methods for credit writes

**File:** `backend/metacleaner-server/source/supabase_billing.go`
**Problem:** Only `GetCreditBalance` exists. No methods to modify credits.
**Required methods:**
- `UpsertCreditBalance(ctx, userID, subscriptionCredits, purchasedCredits)` — creates row if missing, updates if exists
- `AddPurchasedCredits(ctx, userID, amount int)` — atomically increments purchased_credits
- `SetSubscriptionCredits(ctx, userID, amount int)` — sets subscription_credits to exact value (for reset/zero)
- `DeductCredits(ctx, userID, amount int) error` — deducts from subscription first, then purchased; returns error if insufficient
- `RecordCreditTransaction(ctx, userID, amount int, txType, creditSource, referenceID, description string)` — inserts into credit_transactions (skip if amount == 0)
- Spec reference: Requirement 8 AC1–AC7, Requirement 10 AC4–AC6

### 6. JSON field name mismatch: frontend `credit_balance` vs backend `total_credits`

**File (frontend):** `frontend/metacleaner-app/src/lib/types/billing.ts`
**File (backend):** `backend/metacleaner-server/source/billing_handlers.go`
**Problem:** Frontend expects `credit_balance` but backend sends `total_credits`.
**Fix:** Either rename backend JSON tag to `"credit_balance"` or rename frontend field to `total_credits`. Pick one — they must match.
- Spec reference: Requirement 9 AC5

---

## Important — Required by spec but not blocking basic payment flow

### 7. Credit deduction when processing files

**Files:** `backend/metacleaner-server/source/handlers.go` or `pipeline.go`
**Problem:** No credit check or deduction happens when a user submits a cleaning job.
**Required:**
- Before starting file processing, check user's effective credit balance ≥ number of files
- Reject with descriptive error if insufficient credits (suggest upgrade/purchase)
- After successful processing of each file, deduct 1 credit (subscription first, then purchased)
- Record each deduction as a `credit_transactions` entry with type=`usage`
- Spec reference: Requirement 8 AC5, AC6

### 8. Missing `GET /api/billing/credits` endpoint

**Problem:** Spec requires an endpoint returning credit transaction history + current balances.
**Required:**
- Create handler `HandleGetCredits(db)` returning `{ subscription_credits, purchased_credits, total_credits, transactions: [...] }`
- Transactions should include recent history (e.g., last 50) with timestamp, amount, type, credit_source, reference_id, description
- Register route `GET /api/billing/credits` (authenticated)
- Spec reference: Requirement 8 AC8

### 9. `PUBLIC_APP_URL` missing from metacleaner-web environment files

**Files:** `frontend/metacleaner-web/.env.example`, `frontend/metacleaner-web/.env`
**Problem:** Code imports `PUBLIC_APP_URL` from `$env/static/public` but neither .env file defines it.
**Fix:** Add to both files:
```env
# URL of the MetaCleaner app (for pricing page redirect)
PUBLIC_APP_URL=https://app.metacleaner.com
```
- Spec reference: Requirement 5 AC1

### 10. Delete legacy web pricing section files

**Files to remove:**
- `frontend/metacleaner-web/src/routes/pricing/sections/PricingPlansSection.svelte`
- `frontend/metacleaner-web/src/routes/pricing/sections/PricingHeaderSection.svelte`
- `frontend/metacleaner-web/src/routes/pricing/components/` (if still present with old local components)

**Problem:** The pricing `+page.svelte` now imports directly from `metacleaner-shared`, making these local wrappers dead code. They still import from `$lib/repositories` (old location).
- Spec reference: Requirement 1 AC4 (visual parity / no duplication)

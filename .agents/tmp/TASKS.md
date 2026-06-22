# Tasks: Stripe Subscription — Missing Credit System

- [x] 1. [HIGH] Add `UpsertCreditBalance` method to `supabase_billing.go` — upserts `credit_balances` row with given subscription_credits and purchased_credits for a user_id
- [x] 2. [HIGH] Add `AddPurchasedCredits` method to `supabase_billing.go` — atomically increments `purchased_credits` by amount (read current, write new value)
- [x] 3. [HIGH] Add `SetSubscriptionCredits` method to `supabase_billing.go` — sets `subscription_credits` to exact value for a user
- [x] 4. [HIGH] Add `DeductCredits` method to `supabase_billing.go` — deducts N credits (subscription first, then purchased); returns error if insufficient balance
- [x] 5. [HIGH] Add `RecordCreditTransaction` method to `supabase_billing.go` — inserts row into `credit_transactions` with user_id, amount, type, credit_source, reference_id, description
- [x] 6. [HIGH] Add `GetCreditTransactions` method to `supabase_billing.go` — fetches recent credit_transactions for a user (ordered desc, limited)
- [ ] 7. [HIGH] Fix `handleCheckoutSessionCompleted` in `billing_webhook.go` — when mode == "payment", read credit_pack metadata, call `AddPurchasedCredits(50)` and `RecordCreditTransaction` with type=purchase
- [ ] 8. [HIGH] Fix `handleCheckoutSessionCompleted` in `billing_webhook.go` — after `CreateSubscription`, call `UpsertCreditBalance` to set subscription_credits=100 and `RecordCreditTransaction` with type=subscription_renewal
- [ ] 9. [HIGH] Add `case "invoice.paid"` to webhook switch in `billing_webhook.go` — implement `handleInvoicePaid` that resets subscription_credits=100 on renewal invoices (skip initial invoice by checking billing_reason or existing subscription)
- [ ] 10. [HIGH] Fix `handleSubscriptionDeleted` in `billing_webhook.go` — after updating status to cancelled, call `SetSubscriptionCredits(ctx, userID, 0)` (requires looking up userID from subscription)
- [ ] 11. [HIGH] Add credit check to `HandleCreateJob` in `handlers.go` — before creating the job, verify user's total credits ≥ len(files); reject with 402 and descriptive error if insufficient
- [ ] 12. [HIGH] Add credit deduction after successful file processing in `handlers.go` or `pipeline.go` — deduct 1 credit per processed file and record transaction with type=usage
- [ ] 13. [MEDIUM] Add `HandleGetCredits` handler in `billing_handlers.go` — returns JSON with subscription_credits, purchased_credits, total_credits, and transactions array (last 50)
- [ ] 14. [MEDIUM] Register `GET /api/billing/credits` route in `router.go` with auth middleware
- [ ] 15. [MEDIUM] Fix JSON field mismatch in `frontend/metacleaner-app/src/lib/types/billing.ts` — rename `credit_balance` to `total_credits` to match backend's `SubscriptionStatusResponse`
- [ ] 16. [LOW] Add `PUBLIC_APP_URL=https://app.metacleaner.com` to `frontend/metacleaner-web/.env.example`
- [ ] 17. [LOW] Delete legacy pricing files from metacleaner-web: `src/routes/pricing/sections/PricingPlansSection.svelte`, `src/routes/pricing/sections/PricingHeaderSection.svelte`, and `src/routes/pricing/components/` directory (BillingToggle, PricingCard, EnterpriseBanner + their stories)

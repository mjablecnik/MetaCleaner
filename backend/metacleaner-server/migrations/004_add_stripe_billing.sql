-- MetaCleaner Stripe Billing Migration Script (004)
-- Adds Stripe subscription support: customer mapping, subscriptions, and credit tracking.
-- This script is idempotent: safe to run multiple times without errors.
--
-- Prerequisites: 001_init.sql, 002_add_auth_profiles.sql, 003_add_file_hash_columns.sql must have been applied first.
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f migrations/004_add_stripe_billing.sql

-- ============================================================
-- stripe_customers: Maps Supabase user IDs to Stripe customer IDs.
-- One row per user — enforced by UNIQUE constraint on user_id.
-- ============================================================

CREATE TABLE IF NOT EXISTS stripe_customers (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT        NOT NULL UNIQUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE stripe_customers IS
    'Maps Supabase auth.users to Stripe customer IDs. One customer per user.';

CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id
    ON stripe_customers (user_id);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id
    ON stripe_customers (stripe_customer_id);

-- ============================================================
-- subscriptions: Tracks active and historical Stripe subscriptions.
-- status values: active, past_due, cancelled, incomplete, trialing
-- billing_period values: monthly, yearly (NULL for one-time or free)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT        UNIQUE,
    stripe_customer_id     TEXT        NOT NULL,
    plan_id                TEXT        NOT NULL,
    status                 TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'past_due', 'cancelled', 'incomplete', 'trialing')),
    billing_period         TEXT        CHECK (billing_period IN ('monthly', 'yearly')),
    current_period_start   TIMESTAMPTZ,
    current_period_end     TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE subscriptions IS
    'Stripe subscription records per user. Updated via webhook events from Stripe.';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
    ON subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id
    ON subscriptions (stripe_subscription_id);

-- Keep updated_at current on every subscription row update.
CREATE OR REPLACE FUNCTION set_subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION set_subscriptions_updated_at();

-- ============================================================
-- credit_balances: Tracks per-user credit counters.
-- subscription_credits: reset each billing cycle (100/month).
-- purchased_credits: never expire, unaffected by subscription changes.
-- ============================================================

CREATE TABLE IF NOT EXISTS credit_balances (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_credits  INTEGER     NOT NULL DEFAULT 0 CHECK (subscription_credits >= 0),
    purchased_credits     INTEGER     NOT NULL DEFAULT 0 CHECK (purchased_credits >= 0),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE credit_balances IS
    'Per-user credit counters. subscription_credits reset each billing cycle; purchased_credits never expire.';

CREATE INDEX IF NOT EXISTS idx_credit_balances_user_id
    ON credit_balances (user_id);

-- Keep updated_at current on every credit_balances row update.
CREATE OR REPLACE FUNCTION set_credit_balances_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS credit_balances_updated_at ON credit_balances;
CREATE TRIGGER credit_balances_updated_at
    BEFORE UPDATE ON credit_balances
    FOR EACH ROW EXECUTE FUNCTION set_credit_balances_updated_at();

-- ============================================================
-- credit_transactions: Audit log of every credit addition/deduction.
-- type values: purchase, subscription_renewal, usage
-- credit_source values: subscription, purchased
-- amount: positive for additions, negative for deductions
-- reference_id: checkout session ID, invoice ID, or job ID
-- ============================================================

CREATE TABLE IF NOT EXISTS credit_transactions (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount        INTEGER     NOT NULL,
    type          TEXT        NOT NULL CHECK (type IN ('purchase', 'subscription_renewal', 'usage')),
    credit_source TEXT        NOT NULL CHECK (credit_source IN ('subscription', 'purchased')),
    reference_id  TEXT,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE credit_transactions IS
    'Audit log for all credit additions and deductions. Zero-amount transactions are skipped by application logic.';

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
    ON credit_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at
    ON credit_transactions (created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- stripe_customers: users can only read their own record (backend writes via service role)
DROP POLICY IF EXISTS stripe_customers_select_own ON stripe_customers;
CREATE POLICY stripe_customers_select_own ON stripe_customers
    FOR SELECT
    USING (user_id = auth.uid());

-- subscriptions: users can only read their own records
DROP POLICY IF EXISTS subscriptions_select_own ON subscriptions;
CREATE POLICY subscriptions_select_own ON subscriptions
    FOR SELECT
    USING (user_id = auth.uid());

-- credit_balances: users can only read their own record
DROP POLICY IF EXISTS credit_balances_select_own ON credit_balances;
CREATE POLICY credit_balances_select_own ON credit_balances
    FOR SELECT
    USING (user_id = auth.uid());

-- credit_transactions: users can only read their own records
DROP POLICY IF EXISTS credit_transactions_select_own ON credit_transactions;
CREATE POLICY credit_transactions_select_own ON credit_transactions
    FOR SELECT
    USING (user_id = auth.uid());

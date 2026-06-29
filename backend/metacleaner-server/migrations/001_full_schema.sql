-- MetaCleaner Full Database Schema
-- Run this against your Supabase project to create all required tables.
-- This script is idempotent: safe to run multiple times without errors.
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f migrations/001_full_schema.sql

-- Enable the pgcrypto extension for gen_random_uuid() if not already enabled.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- cleaning_jobs
-- ============================================================

CREATE TABLE IF NOT EXISTS cleaning_jobs (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID,
    status                TEXT        NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    total_files           INTEGER     NOT NULL DEFAULT 0,
    files_completed       INTEGER     NOT NULL DEFAULT 0,
    fields_removed        INTEGER     NOT NULL DEFAULT 0,
    gps_locations_removed INTEGER     NOT NULL DEFAULT 0,
    total_time_seconds    INTEGER,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at          TIMESTAMPTZ
);

COMMENT ON TABLE cleaning_jobs IS
    'Tracks metadata-cleaning jobs. Each job processes one or more uploaded files sequentially.';

CREATE INDEX IF NOT EXISTS idx_cleaning_jobs_user_id
    ON cleaning_jobs (user_id);


-- ============================================================
-- job_files
-- ============================================================

CREATE TABLE IF NOT EXISTS job_files (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id             UUID        NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    user_id            UUID,
    file_name          TEXT        NOT NULL,
    original_name      TEXT,
    file_extension     TEXT        NOT NULL,
    file_size_bytes    BIGINT      NOT NULL DEFAULT 0,
    file_type          TEXT        NOT NULL CHECK (file_type IN ('image', 'video')),
    format             TEXT        NOT NULL,
    device             TEXT,
    status             TEXT        NOT NULL CHECK (status IN ('pending', 'in_progress', 'done', 'error')),
    fields_removed     INTEGER     NOT NULL DEFAULT 0,
    gps_removed        BOOLEAN     NOT NULL DEFAULT FALSE,
    error_code         TEXT,
    error_message      TEXT,
    metadata_breakdown JSONB,
    sha256_hash        TEXT        DEFAULT '',
    cleaned_name       TEXT        DEFAULT '',
    processed_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE job_files IS
    'Per-file records within a cleaning job. metadata_breakdown holds the full EXIF/GPS/XMP/ID3 breakdown as JSON.';

CREATE INDEX IF NOT EXISTS idx_job_files_job_id
    ON job_files (job_id);

CREATE INDEX IF NOT EXISTS idx_job_files_user_id
    ON job_files (user_id);


-- ============================================================
-- cleaning_reports
-- ============================================================

CREATE TABLE IF NOT EXISTS cleaning_reports (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id                UUID        NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    user_id               UUID,
    report_id             TEXT        NOT NULL UNIQUE,
    date                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    files_processed       INTEGER     NOT NULL DEFAULT 0,
    fields_removed        INTEGER     NOT NULL DEFAULT 0,
    gps_locations_removed INTEGER     NOT NULL DEFAULT 0,
    total_time_seconds    INTEGER     NOT NULL DEFAULT 0,
    file_types            TEXT        NOT NULL DEFAULT '',
    dominant_type         TEXT        NOT NULL DEFAULT '',
    has_gps               BOOLEAN     NOT NULL DEFAULT FALSE,
    tags                  TEXT[]      NOT NULL DEFAULT '{}',
    chart_data            JSONB       NOT NULL DEFAULT '[]',
    pdf_path              TEXT,
    pdf_status            TEXT        NOT NULL DEFAULT 'pending' CHECK (pdf_status IN ('pending', 'uploaded', 'failed')),
    created_by_name       TEXT        DEFAULT NULL,
    created_by_email      TEXT        DEFAULT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cleaning_reports IS
    'Persistent cleaning report records created after job completion. pdf_path references the PDF stored in Supabase Storage bucket ''cleaning-reports''.';

CREATE INDEX IF NOT EXISTS idx_cleaning_reports_date
    ON cleaning_reports (date DESC);

CREATE INDEX IF NOT EXISTS idx_cleaning_reports_job_id
    ON cleaning_reports (job_id);

CREATE INDEX IF NOT EXISTS idx_cleaning_reports_user_id
    ON cleaning_reports (user_id);


-- ============================================================
-- profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name     TEXT        NOT NULL DEFAULT '',
    last_name      TEXT        NOT NULL DEFAULT '',
    email          TEXT        NOT NULL DEFAULT '',
    deactivated_at TIMESTAMPTZ DEFAULT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS
    'User profile data linked to auth.users. Created automatically at registration.';

CREATE INDEX IF NOT EXISTS idx_profiles_deactivated_at
    ON profiles (deactivated_at) WHERE deactivated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_deactivated_at_expired
    ON profiles (deactivated_at) WHERE deactivated_at IS NOT NULL;

CREATE OR REPLACE FUNCTION set_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_profiles_updated_at();


-- ============================================================
-- stripe_customers
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
-- subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id   TEXT        UNIQUE,
    stripe_customer_id       TEXT        NOT NULL,
    plan_id                  TEXT        NOT NULL,
    status                   TEXT        NOT NULL DEFAULT 'active'
                                 CHECK (status IN ('active', 'past_due', 'cancelled', 'cancelling', 'incomplete', 'trialing')),
    billing_period           TEXT        CHECK (billing_period IN ('monthly', 'yearly')),
    current_period_start     TIMESTAMPTZ,
    current_period_end       TIMESTAMPTZ,
    scheduled_plan_id        TEXT        DEFAULT NULL,
    scheduled_billing_period TEXT        DEFAULT NULL,
    scheduled_change_date    TIMESTAMPTZ DEFAULT NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE subscriptions IS
    'Stripe subscription records per user. Updated via webhook events from Stripe.';

COMMENT ON COLUMN subscriptions.scheduled_plan_id IS
    'Plan ID the subscription will switch to at the end of the current billing period (downgrade).';
COMMENT ON COLUMN subscriptions.scheduled_billing_period IS
    'Billing period for the scheduled plan change.';
COMMENT ON COLUMN subscriptions.scheduled_change_date IS
    'When the scheduled plan change will take effect (typically current_period_end).';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
    ON subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id
    ON subscriptions (stripe_subscription_id);

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
-- credit_balances
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
-- credit_transactions
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
-- api_keys
-- ============================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name         TEXT        NOT NULL CHECK (char_length(name) <= 100),
    key_hash     TEXT        NOT NULL UNIQUE,
    key_prefix   TEXT        NOT NULL,
    key_suffix   TEXT        NOT NULL,
    status       TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    note         TEXT        CHECK (note IS NULL OR char_length(note) <= 500),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    revoked_at   TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);


-- ============================================================
-- email_change_tokens
-- ============================================================

CREATE TABLE IF NOT EXISTS email_change_tokens (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token      TEXT        NOT NULL UNIQUE,
    new_email  TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + interval '1 hour')
);

CREATE INDEX IF NOT EXISTS idx_email_change_tokens_token ON email_change_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_change_tokens_expires_at ON email_change_tokens(expires_at);


-- ============================================================
-- Foreign keys (SET NULL for user deletion — preserve historical data)
-- ============================================================

ALTER TABLE cleaning_jobs
    ADD CONSTRAINT cleaning_jobs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE job_files
    ADD CONSTRAINT job_files_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cleaning_reports
    ADD CONSTRAINT cleaning_reports_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


-- ============================================================
-- Row Level Security
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE USING (id = auth.uid());

-- cleaning_jobs
ALTER TABLE cleaning_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cleaning_jobs_select_own ON cleaning_jobs;
CREATE POLICY cleaning_jobs_select_own ON cleaning_jobs
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_jobs_insert_own ON cleaning_jobs;
CREATE POLICY cleaning_jobs_insert_own ON cleaning_jobs
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_jobs_update_own ON cleaning_jobs;
CREATE POLICY cleaning_jobs_update_own ON cleaning_jobs
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_jobs_delete_own ON cleaning_jobs;
CREATE POLICY cleaning_jobs_delete_own ON cleaning_jobs
    FOR DELETE USING (user_id = auth.uid());

-- job_files
ALTER TABLE job_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_files_select_own ON job_files;
CREATE POLICY job_files_select_own ON job_files
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS job_files_insert_own ON job_files;
CREATE POLICY job_files_insert_own ON job_files
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS job_files_update_own ON job_files;
CREATE POLICY job_files_update_own ON job_files
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS job_files_delete_own ON job_files;
CREATE POLICY job_files_delete_own ON job_files
    FOR DELETE USING (user_id = auth.uid());

-- cleaning_reports
ALTER TABLE cleaning_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cleaning_reports_select_own ON cleaning_reports;
CREATE POLICY cleaning_reports_select_own ON cleaning_reports
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_reports_insert_own ON cleaning_reports;
CREATE POLICY cleaning_reports_insert_own ON cleaning_reports
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_reports_update_own ON cleaning_reports;
CREATE POLICY cleaning_reports_update_own ON cleaning_reports
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_reports_delete_own ON cleaning_reports;
CREATE POLICY cleaning_reports_delete_own ON cleaning_reports
    FOR DELETE USING (user_id = auth.uid());

-- stripe_customers
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stripe_customers_select_own ON stripe_customers;
CREATE POLICY stripe_customers_select_own ON stripe_customers
    FOR SELECT USING (user_id = auth.uid());

-- subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_select_own ON subscriptions;
CREATE POLICY subscriptions_select_own ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- credit_balances
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_balances_select_own ON credit_balances;
CREATE POLICY credit_balances_select_own ON credit_balances
    FOR SELECT USING (user_id = auth.uid());

-- credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_transactions_select_own ON credit_transactions;
CREATE POLICY credit_transactions_select_own ON credit_transactions
    FOR SELECT USING (user_id = auth.uid());

-- api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own keys" ON api_keys;
CREATE POLICY "Users can manage own keys"
    ON api_keys
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- email_change_tokens
ALTER TABLE email_change_tokens ENABLE ROW LEVEL SECURITY;

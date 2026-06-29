-- MetaCleaner Auth Migration Script (002)
-- Adds user authentication support: profiles table, user_id columns, and RLS policies.
-- This script is idempotent: safe to run multiple times without errors.
--
-- Prerequisites: 001_init.sql must have been applied first.
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f migrations/002_add_auth_profiles.sql

-- ============================================================
-- profiles table
-- ============================================================

-- Create subscription_type enum if it does not exist yet.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type') THEN
        CREATE TYPE subscription_type AS ENUM ('free', 'pro', 'premium');
    END IF;
END
$$;

-- profiles: One row per registered user, linked to auth.users via id.
CREATE TABLE IF NOT EXISTS profiles (
    id                UUID             PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name        TEXT             NOT NULL DEFAULT '',
    last_name         TEXT             NOT NULL DEFAULT '',
    email             TEXT             NOT NULL DEFAULT '',
    subscription_type subscription_type NOT NULL DEFAULT 'free',
    credits           INTEGER          NOT NULL DEFAULT 3,
    created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS
    'User profile data linked to auth.users. Created automatically at registration.';

-- Keep updated_at current on every row update.
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
-- Add user_id to existing tables
-- ============================================================

-- cleaning_jobs
ALTER TABLE cleaning_jobs
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- job_files
ALTER TABLE job_files
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- cleaning_reports
ALTER TABLE cleaning_reports
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- Indexes for user_id lookups
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_cleaning_jobs_user_id
    ON cleaning_jobs (user_id);

CREATE INDEX IF NOT EXISTS idx_job_files_user_id
    ON job_files (user_id);

CREATE INDEX IF NOT EXISTS idx_cleaning_reports_user_id
    ON cleaning_reports (user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
    FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (id = auth.uid());

-- cleaning_jobs
ALTER TABLE cleaning_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cleaning_jobs_select_own ON cleaning_jobs;
CREATE POLICY cleaning_jobs_select_own ON cleaning_jobs
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_jobs_insert_own ON cleaning_jobs;
CREATE POLICY cleaning_jobs_insert_own ON cleaning_jobs
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_jobs_update_own ON cleaning_jobs;
CREATE POLICY cleaning_jobs_update_own ON cleaning_jobs
    FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_jobs_delete_own ON cleaning_jobs;
CREATE POLICY cleaning_jobs_delete_own ON cleaning_jobs
    FOR DELETE
    USING (user_id = auth.uid());

-- job_files
ALTER TABLE job_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_files_select_own ON job_files;
CREATE POLICY job_files_select_own ON job_files
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS job_files_insert_own ON job_files;
CREATE POLICY job_files_insert_own ON job_files
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS job_files_update_own ON job_files;
CREATE POLICY job_files_update_own ON job_files
    FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS job_files_delete_own ON job_files;
CREATE POLICY job_files_delete_own ON job_files
    FOR DELETE
    USING (user_id = auth.uid());

-- cleaning_reports
ALTER TABLE cleaning_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cleaning_reports_select_own ON cleaning_reports;
CREATE POLICY cleaning_reports_select_own ON cleaning_reports
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_reports_insert_own ON cleaning_reports;
CREATE POLICY cleaning_reports_insert_own ON cleaning_reports
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_reports_update_own ON cleaning_reports;
CREATE POLICY cleaning_reports_update_own ON cleaning_reports
    FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS cleaning_reports_delete_own ON cleaning_reports;
CREATE POLICY cleaning_reports_delete_own ON cleaning_reports
    FOR DELETE
    USING (user_id = auth.uid());

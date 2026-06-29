-- MetaCleaner Account Lifecycle Migration (009)
-- Implements soft-delete with 30-day grace period and report identity denormalization.
--
-- Changes:
--   1. Add deactivated_at column to profiles (soft delete marker)
--   2. Add created_by_name and created_by_email to cleaning_reports (identity snapshot)
--   3. Change ON DELETE CASCADE to ON DELETE SET NULL on cleaning_jobs, job_files,
--      and cleaning_reports user_id FK (preserve reports/jobs after hard delete)
--
-- Prerequisites: 008_add_email_change_tokens.sql must have been applied first.
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f migrations/009_add_account_lifecycle.sql

-- ============================================================
-- 1. Soft delete support on profiles
-- ============================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ DEFAULT NULL;

-- Partial index for quickly finding active profiles
CREATE INDEX IF NOT EXISTS idx_profiles_deactivated_at
    ON profiles (deactivated_at) WHERE deactivated_at IS NULL;

-- Index for the cleanup cron to find expired deactivated accounts
CREATE INDEX IF NOT EXISTS idx_profiles_deactivated_at_expired
    ON profiles (deactivated_at) WHERE deactivated_at IS NOT NULL;

-- ============================================================
-- 2. Denormalize creator identity into cleaning_reports
-- ============================================================

ALTER TABLE cleaning_reports
    ADD COLUMN IF NOT EXISTS created_by_name TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS created_by_email TEXT DEFAULT NULL;

-- ============================================================
-- 3. Change FK on cleaning_jobs.user_id from CASCADE to SET NULL
-- ============================================================

-- Allow user_id to be NULL (required for SET NULL to work)
ALTER TABLE cleaning_jobs
    ALTER COLUMN user_id DROP NOT NULL;

-- Drop old CASCADE constraint and recreate with SET NULL
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'cleaning_jobs'::regclass
      AND att.attname = 'user_id'
      AND con.contype = 'f';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE cleaning_jobs DROP CONSTRAINT ' || constraint_name;
    END IF;
END
$$;

ALTER TABLE cleaning_jobs
    ADD CONSTRAINT cleaning_jobs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- 4. Change FK on job_files.user_id from CASCADE to SET NULL
-- ============================================================

ALTER TABLE job_files
    ALTER COLUMN user_id DROP NOT NULL;

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'job_files'::regclass
      AND att.attname = 'user_id'
      AND con.contype = 'f';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE job_files DROP CONSTRAINT ' || constraint_name;
    END IF;
END
$$;

ALTER TABLE job_files
    ADD CONSTRAINT job_files_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- 5. Change FK on cleaning_reports.user_id from CASCADE to SET NULL
-- ============================================================

ALTER TABLE cleaning_reports
    ALTER COLUMN user_id DROP NOT NULL;

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'cleaning_reports'::regclass
      AND att.attname = 'user_id'
      AND con.contype = 'f';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE cleaning_reports DROP CONSTRAINT ' || constraint_name;
    END IF;
END
$$;

ALTER TABLE cleaning_reports
    ADD CONSTRAINT cleaning_reports_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- 6. Update RLS policies to allow reading orphaned reports/jobs
-- ============================================================

-- Reports with user_id=NULL should still be readable via public endpoints.
-- The existing RLS policies use user_id = auth.uid() which won't match NULL,
-- but public endpoints use the service role key that bypasses RLS anyway.
-- No RLS changes needed.

-- MetaCleaner Migration Script (006)
-- Removes legacy "credits" and "subscription_type" columns from profiles table.
-- Credit tracking is now handled exclusively by credit_balances and credit_transactions tables.
-- Subscription status is tracked in the subscriptions table.
-- This script is idempotent: safe to run multiple times without errors.
--
-- Prerequisites: migration004.sql must have been applied first (credit_balances and subscriptions tables exist).
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f scripts/migration006.sql

ALTER TABLE profiles DROP COLUMN IF EXISTS credits;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_type;

-- Drop the subscription_type enum type if no other table uses it.
-- This is safe because profiles was the only table using this type.
DROP TYPE IF EXISTS subscription_type;

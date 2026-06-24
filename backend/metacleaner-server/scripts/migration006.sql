-- MetaCleaner Migration Script (006)
-- Removes the legacy "credits" column from profiles table.
-- Credit tracking is now handled exclusively by credit_balances and credit_transactions tables.
-- This script is idempotent: safe to run multiple times without errors.
--
-- Prerequisites: migration004.sql must have been applied first (credit_balances table exists).
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f scripts/migration006.sql

ALTER TABLE profiles DROP COLUMN IF EXISTS credits;

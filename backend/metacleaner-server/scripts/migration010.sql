-- Migration 010: Add scheduled downgrade columns to subscriptions
--
-- When a user downgrades, the change takes effect at the end of the current billing period.
-- These columns track the pending plan change so the UI can display it.
--
-- Prerequisites: migration009.sql must have been applied first.
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f scripts/migration010.sql

-- ============================================================
-- 1. Add scheduled change columns to subscriptions
-- ============================================================

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS scheduled_plan_id TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS scheduled_billing_period TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS scheduled_change_date TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN subscriptions.scheduled_plan_id IS
    'Plan ID the subscription will switch to at the end of the current billing period (downgrade).';
COMMENT ON COLUMN subscriptions.scheduled_billing_period IS
    'Billing period for the scheduled plan change.';
COMMENT ON COLUMN subscriptions.scheduled_change_date IS
    'When the scheduled plan change will take effect (typically current_period_end).';

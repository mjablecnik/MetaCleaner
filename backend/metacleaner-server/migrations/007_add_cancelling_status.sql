-- Migration 007: Add 'cancelling' status to subscriptions check constraint
-- ============================================================
-- The cancel flow sets status to 'cancelling' when the user requests cancellation
-- but the subscription remains active until period end. The existing check constraint
-- did not include this value, causing the update to fail.
-- This script is idempotent: safe to run multiple times without errors.
-- ============================================================

-- Drop the existing check constraint and re-create with the additional status value.
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'past_due', 'cancelled', 'cancelling', 'incomplete', 'trialing'));

-- Migration 008: Create email_change_tokens table
-- ============================================================
-- Stores verification tokens for the email change flow.
-- Tokens are created when a user requests an email change and consumed
-- when the user clicks the confirmation link.
-- This script is idempotent: safe to run multiple times without errors.
-- ============================================================

CREATE TABLE IF NOT EXISTS email_change_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    new_email text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_email_change_tokens_token ON email_change_tokens(token);

-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_email_change_tokens_expires_at ON email_change_tokens(expires_at);

-- Enable RLS (service role bypasses RLS, so no policies needed for backend access)
ALTER TABLE email_change_tokens ENABLE ROW LEVEL SECURITY;

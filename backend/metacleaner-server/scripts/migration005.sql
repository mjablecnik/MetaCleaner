-- Migration 005: API Keys table
-- Adds API key management support: per-user API keys with hashed storage,
-- status tracking (active/revoked), and fast lookup by hash during authentication.
--
-- Prerequisites: migration.sql, migration002.sql, migration003.sql, migration004.sql must have been applied first.
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f scripts/migration005.sql

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

-- Fast lookup by hash during authentication
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Fast listing by user
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own keys (backend writes via service role)
DROP POLICY IF EXISTS "Users can manage own keys" ON api_keys;
CREATE POLICY "Users can manage own keys"
    ON api_keys
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

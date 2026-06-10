-- MetaCleaner Database Migration Script
-- Run this against your Supabase project to create all required tables.
-- This script is idempotent: safe to run multiple times without errors.
--
-- Usage:
--   In the Supabase dashboard: SQL Editor → paste this script → Run
--   Via psql: psql "$DATABASE_URL" -f scripts/migration.sql

-- Enable the pgcrypto extension for gen_random_uuid() if not already enabled.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- cleaning_jobs: Tracks each metadata-stripping job submitted by a client.
-- One job corresponds to one batch of uploaded files processed together.
CREATE TABLE IF NOT EXISTS cleaning_jobs (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    status               TEXT        NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    total_files          INTEGER     NOT NULL DEFAULT 0,
    files_completed      INTEGER     NOT NULL DEFAULT 0,
    fields_removed       INTEGER     NOT NULL DEFAULT 0,
    gps_locations_removed INTEGER    NOT NULL DEFAULT 0,
    total_time_seconds   INTEGER,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at         TIMESTAMPTZ
);

COMMENT ON TABLE cleaning_jobs IS
    'Tracks metadata-cleaning jobs. Each job processes one or more uploaded files sequentially.';

-- job_files: One row per file within a cleaning job.
-- Stores per-file processing results including the full metadata breakdown as JSONB.
CREATE TABLE IF NOT EXISTS job_files (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id             UUID        NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    file_name          TEXT        NOT NULL,
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
    processed_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE job_files IS
    'Per-file records within a cleaning job. metadata_breakdown holds the full EXIF/GPS/XMP/ID3 breakdown as JSON.';

-- cleaning_reports: Persistent summary records created after each completed job.
-- Linked to a Supabase Storage PDF via pdf_path; tags and chart_data support the frontend report view.
CREATE TABLE IF NOT EXISTS cleaning_reports (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id               UUID        NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    report_id            TEXT        NOT NULL UNIQUE,  -- human-readable: MCR-YYYY-MMDD-XX
    date                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    files_processed      INTEGER     NOT NULL DEFAULT 0,
    fields_removed       INTEGER     NOT NULL DEFAULT 0,
    gps_locations_removed INTEGER    NOT NULL DEFAULT 0,
    total_time_seconds   INTEGER     NOT NULL DEFAULT 0,
    file_types           TEXT        NOT NULL DEFAULT '',
    dominant_type        TEXT        NOT NULL DEFAULT '',
    has_gps              BOOLEAN     NOT NULL DEFAULT FALSE,
    tags                 TEXT[]      NOT NULL DEFAULT '{}',
    chart_data           JSONB       NOT NULL DEFAULT '[]',
    pdf_path             TEXT,
    pdf_status           TEXT        NOT NULL DEFAULT 'pending' CHECK (pdf_status IN ('pending', 'uploaded', 'failed')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cleaning_reports IS
    'Persistent cleaning report records created after job completion. pdf_path references the PDF stored in Supabase Storage bucket ''cleaning-reports''.';

-- Indexes for common query patterns.
CREATE INDEX IF NOT EXISTS idx_job_files_job_id
    ON job_files (job_id);

CREATE INDEX IF NOT EXISTS idx_cleaning_reports_date
    ON cleaning_reports (date DESC);

CREATE INDEX IF NOT EXISTS idx_cleaning_reports_job_id
    ON cleaning_reports (job_id);

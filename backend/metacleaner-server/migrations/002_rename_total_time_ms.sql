-- Rename total_time_seconds to total_time_ms to reflect the actual stored unit.
-- The column has always stored milliseconds (time.Since(start).Milliseconds()),
-- so the old name was misleading to any direct SQL consumer.
--
-- Run this against existing databases after applying 001_full_schema.sql.
-- Safe to re-run: IF EXISTS guards prevent errors on a fresh schema.

ALTER TABLE cleaning_jobs
    RENAME COLUMN total_time_seconds TO total_time_ms;

ALTER TABLE cleaning_reports
    RENAME COLUMN total_time_seconds TO total_time_ms;

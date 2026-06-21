-- Migration 003: Add SHA-256 hash column to job_files for file integrity verification
-- This column stores the hash of the cleaned file, used in PDF reports as proof of integrity.

ALTER TABLE job_files ADD COLUMN IF NOT EXISTS sha256_hash TEXT DEFAULT '';

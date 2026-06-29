-- Migration 003: Add SHA-256 hash and cleaned filename columns to job_files
-- sha256_hash: stores the hash of the cleaned file, used in PDF reports as proof of integrity.
-- cleaned_name: stores the output filename (e.g. IMG_f-abc_cleaned.jpg) shown in reports.

ALTER TABLE job_files ADD COLUMN IF NOT EXISTS sha256_hash TEXT DEFAULT '';
ALTER TABLE job_files ADD COLUMN IF NOT EXISTS cleaned_name TEXT DEFAULT '';

-- First and last name on ContactRequests (required on the contact form from now on).
-- Older messages have none, so the columns stay nullable. Additive and idempotent.
-- The landing role's INSERT grant is table-wide, so it covers the new columns.
-- Run with: pnpm db:migrate migrations/0009_contact_name.sql

BEGIN;

ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text;

COMMIT;

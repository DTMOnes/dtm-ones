-- Lets Staff mark which club is the current one when two clubs share the latest
-- season (for example a mid-season move). Additive and idempotent.
-- Run with: pnpm db:migrate migrations/0005_career_current.sql

BEGIN;

ALTER TABLE client_career_entries
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT false;

-- New view column goes last so CREATE OR REPLACE keeps existing grants.
CREATE OR REPLACE VIEW roster_career_entries AS
  SELECT client_career_entries.id,
    client_career_entries.client_id,
    client_career_entries.season,
    client_career_entries.club,
    client_career_entries.league,
    client_career_entries.country,
    client_career_entries.sort_order,
    client_career_entries.is_current
  FROM client_career_entries
    JOIN clients ON client_career_entries.client_id = clients.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

COMMIT;

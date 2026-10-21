-- Titles & awards: a team title (trophy icon) or an individual award (star icon).
-- Additive and idempotent. Run with: pnpm db:migrate migrations/0002_award_kind.sql

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'award_kind') THEN
    CREATE TYPE award_kind AS ENUM ('team', 'individual');
  END IF;
END
$$;

ALTER TABLE client_awards
  ADD COLUMN IF NOT EXISTS kind award_kind NOT NULL DEFAULT 'team';

-- New view column goes last so CREATE OR REPLACE keeps existing grants.
CREATE OR REPLACE VIEW roster_awards AS
  SELECT client_awards.id,
    client_awards.client_id,
    client_awards.title,
    client_awards.detail,
    client_awards.year,
    client_awards.sort_order,
    client_awards.kind
  FROM client_awards
    JOIN clients ON client_awards.client_id = clients.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

COMMIT;

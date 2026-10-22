-- Keep a readable copy of the Clients page password so the Owner can see it in the
-- dashboard. The landing role reads only the hash: its grant is limited to columns.
-- Additive and idempotent. Run with: pnpm db:migrate migrations/0007_roster_access_plain.sql

BEGIN;

ALTER TABLE roster_access
  ADD COLUMN IF NOT EXISTS password text;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dtm_landing') THEN
    REVOKE ALL ON roster_access FROM dtm_landing;
    GRANT SELECT (id, password_hash, updated_at) ON roster_access TO dtm_landing;
  END IF;
END
$$;

COMMIT;

-- The landing Clients list password, set by the Owner in the dashboard. One row,
-- stored as a scrypt hash. Until a row exists, the landing keeps the default password.
-- Additive and idempotent. Run with: pnpm db:migrate migrations/0006_roster_access.sql

BEGIN;

CREATE TABLE IF NOT EXISTS roster_access (
  id integer PRIMARY KEY DEFAULT 1,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT roster_access_single_row CHECK (id = 1)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dtm_landing') THEN
    GRANT SELECT ON roster_access TO dtm_landing;
  END IF;
END
$$;

COMMIT;

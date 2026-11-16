-- The Instagram API long-lived token, renewed weekly by the dashboard (Vercel Cron)
-- and read by the landing for the Signed and NEWS feeds. One row. Until it exists,
-- the landing keeps using INSTAGRAM_ACCESS_TOKEN from its environment.
-- Additive and idempotent. Run with: pnpm db:migrate migrations/0010_instagram_token.sql

BEGIN;

CREATE TABLE IF NOT EXISTS instagram_token (
  id integer PRIMARY KEY DEFAULT 1,
  access_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT instagram_token_single_row CHECK (id = 1)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dtm_landing') THEN
    GRANT SELECT ON instagram_token TO dtm_landing;
  END IF;
END
$$;

COMMIT;

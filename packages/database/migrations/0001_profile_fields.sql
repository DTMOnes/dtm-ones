-- Profile fields from the Instagram-feed redesign: birth date, current league, bio,
-- strengths, season stats, video titles, career entries and titles & awards.
-- Additive and idempotent. Run with: pnpm db:migrate migrations/0001_profile_fields.sql
-- (drizzle-kit push misreads Postgres 18 NOT NULL constraints and offers to truncate
-- clients, so this change is applied by hand.)

BEGIN;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS league text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS strengths text[],
  ADD COLUMN IF NOT EXISTS season_stats jsonb;

ALTER TABLE player_videos
  ADD COLUMN IF NOT EXISTS title text;

CREATE TABLE IF NOT EXISTS client_career_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL
    CONSTRAINT client_career_entries_client_id_clients_id_fk
    REFERENCES clients(id) ON DELETE CASCADE,
  season text NOT NULL,
  club text NOT NULL,
  league text,
  country text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL
    CONSTRAINT client_awards_client_id_clients_id_fk
    REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text,
  year text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- New view columns go last so CREATE OR REPLACE keeps existing grants.
CREATE OR REPLACE VIEW roster AS
  SELECT clients.id,
    clients.kind,
    clients.name,
    clients.nationality,
    clients.last_club,
    clients.eurobasket_link,
    clients.visibility,
    clients.height_cm,
    clients.category_id,
    categories.name AS category_name,
    clients.presentation_image_url,
    clients.presentation_image_key,
    clients.created_at,
    clients.updated_at,
    clients.birth_date,
    clients.league,
    clients.bio,
    clients.strengths,
    clients.season_stats
  FROM clients
    LEFT JOIN categories ON clients.category_id = categories.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

CREATE OR REPLACE VIEW roster_videos AS
  SELECT player_videos.id,
    player_videos.client_id,
    player_videos.youtube_url,
    player_videos.sort_order,
    player_videos.title
  FROM player_videos
    JOIN clients ON player_videos.client_id = clients.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

CREATE OR REPLACE VIEW roster_career_entries AS
  SELECT client_career_entries.id,
    client_career_entries.client_id,
    client_career_entries.season,
    client_career_entries.club,
    client_career_entries.league,
    client_career_entries.country,
    client_career_entries.sort_order
  FROM client_career_entries
    JOIN clients ON client_career_entries.client_id = clients.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

CREATE OR REPLACE VIEW roster_awards AS
  SELECT client_awards.id,
    client_awards.client_id,
    client_awards.title,
    client_awards.detail,
    client_awards.year,
    client_awards.sort_order
  FROM client_awards
    JOIN clients ON client_awards.client_id = clients.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

-- The landing role reads only the public views (skipped where the role does not exist).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'dtm_landing') THEN
    GRANT SELECT ON roster_career_entries, roster_awards TO dtm_landing;
  END IF;
END
$$;

COMMIT;

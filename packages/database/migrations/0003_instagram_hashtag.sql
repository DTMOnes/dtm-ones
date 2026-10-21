-- Instagram hashtag per Client (without "#"): the profile NEWS section shows the
-- agency's posts tagged with it. Additive and idempotent.
-- Run with: pnpm db:migrate migrations/0003_instagram_hashtag.sql

BEGIN;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS instagram_hashtag text;

-- New view column goes last so CREATE OR REPLACE keeps existing grants.
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
    clients.season_stats,
    clients.instagram_hashtag
  FROM clients
    LEFT JOIN categories ON clients.category_id = categories.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

COMMIT;

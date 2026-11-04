-- Readable profile links: /roster/<slug> instead of /roster/<uuid>.
-- The dashboard sets the slug from the name the first time a Client goes public;
-- this fills it for every named Client now. Additive and idempotent.
-- Run with: pnpm db:migrate migrations/0008_client_slug.sql

BEGIN;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS slug text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_slug_key') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Same rule as slugify() in the dashboard: drop accents, lowercase, runs of
-- anything else become "-". Repeated names get -2, -3 by creation order.
WITH base AS (
  SELECT id,
    created_at,
    trim(both '-' from regexp_replace(
      lower(translate(name,
        'áàäâãåéèëêíìïîóòöôõøúùüûñçÁÀÄÂÃÅÉÈËÊÍÌÏÎÓÒÖÔÕØÚÙÜÛÑÇ',
        'aaaaaaeeeeiiiioooooouuuuncAAAAAAEEEEIIIIOOOOOOUUUUNC')),
      '[^a-z0-9]+', '-', 'g')) AS slug
  FROM clients
  WHERE slug IS NULL AND nullif(trim(name), '') IS NOT NULL
),
numbered AS (
  SELECT id,
    slug,
    row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS n
  FROM base
  WHERE slug <> ''
)
UPDATE clients
SET slug = CASE WHEN numbered.n = 1 THEN numbered.slug ELSE numbered.slug || '-' || numbered.n END
FROM numbered
WHERE clients.id = numbered.id;

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
    clients.instagram_hashtag,
    clients.slug
  FROM clients
    LEFT JOIN categories ON clients.category_id = categories.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

COMMIT;

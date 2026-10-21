-- Expose when each Player video was added, so the public profile can list the newest
-- highlights first. Additive and idempotent.
-- Run with: pnpm db:migrate migrations/0004_video_created_at.sql

BEGIN;

-- New view column goes last so CREATE OR REPLACE keeps existing grants.
CREATE OR REPLACE VIEW roster_videos AS
  SELECT player_videos.id,
    player_videos.client_id,
    player_videos.youtube_url,
    player_videos.sort_order,
    player_videos.title,
    player_videos.created_at
  FROM player_videos
    JOIN clients ON player_videos.client_id = clients.id
  WHERE clients.visibility = 'public'::client_visibility AND clients.trashed_at IS NULL;

COMMIT;

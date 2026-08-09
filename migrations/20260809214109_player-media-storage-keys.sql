-- Persist InsForge storage keys alongside URLs for reliable deletes.
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS presentation_image_key text;

ALTER TABLE public.player_gallery_images
  ADD COLUMN IF NOT EXISTS storage_key text;

-- Staff-only writes on player media buckets (client uploads use bridge JWT).
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS storage_player_media_staff_select ON storage.objects;
DROP POLICY IF EXISTS storage_player_media_staff_insert ON storage.objects;
DROP POLICY IF EXISTS storage_player_media_staff_update ON storage.objects;
DROP POLICY IF EXISTS storage_player_media_staff_delete ON storage.objects;

CREATE POLICY storage_player_media_staff_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket IN ('player-presentation', 'player-gallery')
    AND public.is_dashboard_staff()
  );

CREATE POLICY storage_player_media_staff_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket IN ('player-presentation', 'player-gallery')
    AND public.is_dashboard_staff()
  );

CREATE POLICY storage_player_media_staff_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket IN ('player-presentation', 'player-gallery')
    AND public.is_dashboard_staff()
  )
  WITH CHECK (
    bucket IN ('player-presentation', 'player-gallery')
    AND public.is_dashboard_staff()
  );

CREATE POLICY storage_player_media_staff_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket IN ('player-presentation', 'player-gallery')
    AND public.is_dashboard_staff()
  );

GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

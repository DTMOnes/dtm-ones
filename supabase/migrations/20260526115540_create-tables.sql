-- Enums
CREATE TYPE "public"."player_media_types" AS ENUM ('image', 'video');

-- contact_request
CREATE TABLE "public"."contact_request" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "message" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- players
CREATE TABLE "public"."players" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "full_name" varchar(150) NOT NULL,
  "height" varchar(20) NOT NULL,
  "date_of_birth" varchar(50) NOT NULL,
  "nationality" varchar(100) NOT NULL,
  "last_club" varchar(150) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- categories
CREATE TABLE "public"."categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- player_categories (PK compuesta)
CREATE TABLE "public"."player_categories" (
  "player_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  CONSTRAINT "player_categories_player_id_category_id_pk" PRIMARY KEY ("player_id", "category_id"),
  CONSTRAINT "player_categories_player_id_players_id_fk"
    FOREIGN KEY ("player_id") REFERENCES "public"."players" ("id") ON DELETE CASCADE,
  CONSTRAINT "player_categories_category_id_categories_id_fk"
    FOREIGN KEY ("category_id") REFERENCES "public"."categories" ("id") ON DELETE CASCADE
);

-- player_media
CREATE TABLE "public"."player_media" (
  "id" uuid PRIMARY KEY NOT NULL,
  "player_id" uuid NOT NULL,
  "media_type" "public"."player_media_types" NOT NULL,
  "mime_type" text NOT NULL,
  "storage_path" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "player_media_player_id_players_id_fk"
    FOREIGN KEY ("player_id") REFERENCES "public"."players" ("id") ON DELETE CASCADE
);

-- =============================================================================
-- RLS: cualquier usuario con rol `authenticated` puede leer/escribir todo
-- =============================================================================

-- Permisos base para el rol de Supabase Auth
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contact_request TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.players TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.player_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.player_media TO authenticated;

GRANT USAGE ON TYPE public.player_media_types TO authenticated;

-- -----------------------------------------------------------------------------
-- contact_request
-- -----------------------------------------------------------------------------
ALTER TABLE public.contact_request ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_contact_request"
  ON public.contact_request
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- players
-- -----------------------------------------------------------------------------
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_players"
  ON public.players
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- player_categories
-- -----------------------------------------------------------------------------
ALTER TABLE public.player_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_player_categories"
  ON public.player_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- player_media
-- -----------------------------------------------------------------------------
ALTER TABLE public.player_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_player_media"
  ON public.player_media
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

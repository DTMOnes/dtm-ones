export type PlayerStatus = "draft" | "published";

export type PlayerCategoryRef = {
  id: string;
  name: string;
};

export type PlayerGalleryImage = {
  id: string;
  player_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type PlayerVideo = {
  id: string;
  player_id: string;
  youtube_url: string;
  sort_order: number;
  created_at: string;
};

export type Player = {
  id: string;
  slug: string;
  full_name: string;
  nationality: string;
  height_cm: number;
  last_club: string;
  presentation_image_url: string | null;
  status: PlayerStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerListItem = Player & {
  categories: PlayerCategoryRef[];
};

export type PlayerDetail = Player & {
  categories: PlayerCategoryRef[];
  gallery_images: PlayerGalleryImage[];
  videos: PlayerVideo[];
};

export type PublicRosterCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type PublicRosterGalleryImage = {
  id: string;
  url: string;
  sort_order: number;
};

export type PublicRosterVideo = {
  id: string;
  youtube_url: string;
  sort_order: number;
};

export type PublicRosterPlayer = {
  id: string;
  slug: string;
  full_name: string;
  nationality: string;
  height_cm: number;
  last_club: string;
  eurobasket_link: string | null;
  presentation_image_url: string | null;
  categories: PublicRosterCategoryRef[];
  gallery_images: PublicRosterGalleryImage[];
  videos: PublicRosterVideo[];
};

export type PublicRosterCategory = {
  id: string;
  name: string;
  slug: string;
  player_count: number;
};

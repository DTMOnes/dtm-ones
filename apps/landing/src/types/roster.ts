export type PublicRosterCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type PublicRosterPlayer = {
  id: string;
  slug: string;
  full_name: string;
  presentation_image_url: string | null;
  categories: PublicRosterCategoryRef[];
};

export type PublicRosterCategory = {
  id: string;
  name: string;
  slug: string;
  player_count: number;
};

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
  title: string | null;
  sort_order: number;
};

export type PublicRosterSeasonStats = {
  season: string;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  mpg: number | null;
  spg: number | null;
  bpg: number | null;
  fg_pct: number | null;
  three_pct: number | null;
  ft_pct: number | null;
};

export type PublicRosterCareerEntry = {
  id: string;
  season: string;
  club: string;
  league: string | null;
  country: string | null;
  isCurrent: boolean;
};

export type PublicRosterAward = {
  id: string;
  title: string;
  detail: string | null;
  year: string | null;
  kind: "team" | "individual";
};

export type PublicRosterPlayer = {
  id: string;
  kind: "player" | "coach";
  slug: string;
  full_name: string;
  nationality: string;
  height_cm: number | null;
  last_club: string;
  eurobasket_link: string | null;
  presentation_image_url: string | null;
  birth_date: string | null;
  league: string | null;
  bio: string | null;
  strengths: string[];
  season_stats: PublicRosterSeasonStats | null;
  instagram_hashtag: string | null;
  categories: PublicRosterCategoryRef[];
  gallery_images: PublicRosterGalleryImage[];
  videos: PublicRosterVideo[];
  career: PublicRosterCareerEntry[];
  awards: PublicRosterAward[];
};

export type PublicRosterCategory = {
  id: string;
  name: string;
  slug: string;
  player_count: number;
};

/** An Instagram post in a profile NEWS grid. */
export type NewsPost = {
  /** Poster image shown in the grid. */
  src: string;
  alt: string;
  /** The Instagram publication this poster opens. */
  href: string;
};

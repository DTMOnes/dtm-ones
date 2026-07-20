export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type CategoryWithCount = Category & {
  player_count: number;
};

export type CategoryPlayerSummary = {
  id: string;
  full_name: string;
  last_club: string;
};

export type CategoryDetail = Category & {
  players: CategoryPlayerSummary[];
};

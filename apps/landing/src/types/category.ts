export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
};

export type CategoryWithCount = Category & {
  player_count: number;
};

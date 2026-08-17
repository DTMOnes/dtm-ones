export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryWithCount = Category & {
  playerCount: number;
};

export type CategoryPlayerSummary = {
  id: string;
  name: string;
  lastClub: string;
};

export type PlayerVisibility = "public" | "private";

export type PlayerVideo = {
  id: string;
  youtubeUrl: string;
};

export type Player = {
  id: string;
  name: string;
  nationality: string;
  lastClub: string;
  eurobasketLink: string | null;
  visibility: PlayerVisibility;
  heightCm: number | null;
  categoryId: string | null;
  categoryName: string | null;
  presentationImageUrl: string | null;
};

export type PlayerDetail = Player & {
  videos: PlayerVideo[];
};

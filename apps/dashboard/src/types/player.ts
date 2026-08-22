export type PlayerVisibility = "public" | "private";

export type PlayerVideo = {
  id: string;
  youtubeUrl: string;
};

export type PlayerGalleryImage = {
  id: string;
  url: string;
};

export type Player = {
  id: string;
  name: string | null;
  nationality: string | null;
  lastClub: string | null;
  eurobasketLink: string | null;
  visibility: PlayerVisibility;
  heightCm: number | null;
  categoryId: string | null;
  categoryName: string | null;
  presentationImageUrl: string | null;
};

export type PlayerDetail = Player & {
  gallery: PlayerGalleryImage[];
  videos: PlayerVideo[];
};

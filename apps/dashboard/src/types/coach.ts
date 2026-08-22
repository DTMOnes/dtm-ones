export type CoachVisibility = "public" | "private";

export type CoachGalleryImage = {
  id: string;
  url: string;
};

export type Coach = {
  id: string;
  name: string | null;
  nationality: string | null;
  lastClub: string | null;
  eurobasketLink: string | null;
  visibility: CoachVisibility;
  presentationImageUrl: string | null;
  gallery: CoachGalleryImage[];
};

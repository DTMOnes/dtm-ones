export type CoachVisibility = "public" | "private";

export type Coach = {
  id: string;
  name: string;
  nationality: string;
  lastClub: string;
  eurobasketLink: string | null;
  visibility: CoachVisibility;
};

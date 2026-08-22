export type CoachVisibility = "public" | "private";

export type Coach = {
  id: string;
  name: string | null;
  nationality: string | null;
  lastClub: string | null;
  eurobasketLink: string | null;
  visibility: CoachVisibility;
};

export const PLAYER_SECTIONS = [
  { id: "gallery", name: "Gallery" },
  { id: "highlights", name: "Highlights" },
] as const;

export type PlayerSectionId = (typeof PLAYER_SECTIONS)[number]["id"];

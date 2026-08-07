export const PLAYER_SECTIONS = [
  { id: "gallery", name: "Gallery" },
  { id: "highlights", name: "Highlights" },
  { id: "info", name: "Info" },
] as const;

export type PlayerSectionId = (typeof PLAYER_SECTIONS)[number]["id"];

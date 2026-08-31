/**
 * Public social destinations (landing chrome).
 * URLs confirmed in PRODUCT.md / #58.
 */
export const socials = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/dtm.ones/",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@dtmones6926",
  },
] as const;

export type SocialId = (typeof socials)[number]["id"];

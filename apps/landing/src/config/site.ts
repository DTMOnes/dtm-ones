export const pages = [
  { label: "Home", href: "/" },
  { label: "Clients", href: "/players" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const legalPages = [
  { label: "Terms and Conditions", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
] as const;

export const socials = {
  instagram: "https://www.instagram.com/dtm.ones/",
  youtube: "https://www.youtube.com/@dtmones6926/featured",
} as const;

/**
 * Latest signings posters for the home "SIGNED" strip.
 * ponytail: static files copied from the Instagram feed; move to the dashboard or the
 * Instagram API when Staff need to change them without a deploy.
 */
export const signings = [
  { name: "Cli'Ron Hornbeak", src: "/assets/signed/cliron-hornbeak.jpg" },
  { name: "Dylan Smith", src: "/assets/signed/dylan-smith.jpg" },
  { name: "Bakir Cleveland", src: "/assets/signed/bakir-cleveland.jpg" },
  { name: "Latraius Mosley", src: "/assets/signed/latraius-mosley.jpg" },
  { name: "Damir Brooks", src: "/assets/signed/damir-brooks.jpg" },
  { name: "Johu Castillo", src: "/assets/signed/johu-castillo.jpg" },
] as const;

/**
 * Players shown on Home, in order (Client ids). One that stops being public is
 * skipped and the next public players fill the gap, so Home always shows five.
 * ponytail: fixed here; move to the dashboard if Staff need to change it without a deploy.
 */
export const featuredClientIds = [
  "168be1a6-1029-4c6b-b398-bc61a36ccc1b", // Alphonso Anderson
  "7bfe9b76-75ba-4959-891b-efc6edef5f0d", // Bryan Carabali
  "4dd0db17-320a-41f3-a146-adbc1a96739e", // Romeao Ferguson
  "0c3e9601-9db8-48ee-a1ae-0a4ab59c17fb", // Jerome Meyinsse
  "27d42508-e7d1-45d7-8352-5c7fe7b9b421", // Tavario Miller
] as const;

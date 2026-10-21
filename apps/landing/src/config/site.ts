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

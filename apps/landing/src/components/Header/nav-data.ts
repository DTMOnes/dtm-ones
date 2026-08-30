export const overlayPages = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Inline nav ↔ hamburger (`nav` theme breakpoint).
 * Search field ↔ button stays on Tailwind `lg` (1024).
 */
export const NAV_BREAKPOINT_PX = 1250;

/** Home is current only on `/` — not on Player `/roster/...` pages. */
export function isNavCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

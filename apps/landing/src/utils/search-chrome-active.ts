/** Desktop filter button: Category or Coaches selected (not typed search alone). */
export function isDesktopFilterActive(params: {
  c: string | null;
  kind: string | null;
}): boolean {
  return Boolean(params.c || params.kind);
}

/** Mobile search control: any search or filter query is active. */
export function isMobileSearchControlActive(params: {
  q: string | null;
  c: string | null;
  kind: string | null;
}): boolean {
  return Boolean(params.q?.trim() || params.c || params.kind);
}

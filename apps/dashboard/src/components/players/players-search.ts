const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Keep only valid, de-duplicated category UUIDs. Shared by the SSR page and the
 * client view so both compute an identical query key. */
export function normalizePlayerCategoryIds(raw: string[]): string[] {
  return [...new Set(raw.filter((id) => UUID_RE.test(id)))];
}

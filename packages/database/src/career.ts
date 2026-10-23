// Career season rules shared by the dashboard and the landing. No database code here,
// so client components can import it through "@dtm/database/career".

/** Last year a season reaches: "2021-2024" → 2024, "2025-26" → 2026, "2026" → 2026. */
export function seasonEndYear(season: string): number {
  const years = season.match(/\d{4}|\d{2}/g);
  if (!years) return 0;
  const last = years[years.length - 1]!;
  if (last.length === 4) return Number(last);
  const century = years.find((year) => year.length === 4)?.slice(0, 2) ?? "20";
  return Number(century + last);
}

/**
 * Ids of the entries that share the latest season, when there are two or more:
 * only then does Staff have to say which club is the current one.
 */
export function latestSeasonTies(career: { id: string; season: string }[]): Set<string> {
  const latest = Math.max(0, ...career.map((entry) => seasonEndYear(entry.season)));
  const tied = career.filter((entry) => seasonEndYear(entry.season) === latest);
  return new Set(tied.length > 1 ? tied.map((entry) => entry.id) : []);
}

/**
 * Titles newest first by year ("2026", "2025-26" → 2026). Ones without a year go
 * last; ties keep the order Staff entered them in.
 */
export function sortAwardsByYear<T extends { year: string | null }>(awards: T[]): T[] {
  const yearOf = (award: T) => (award.year ? seasonEndYear(award.year) : 0);
  return [...awards].sort((a, b) => yearOf(b) - yearOf(a));
}

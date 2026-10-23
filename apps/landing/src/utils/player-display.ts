import { seasonEndYear } from "@dtm/database/career";

import type { PublicRosterCareerEntry, PublicRosterPlayer } from "@/types/roster";

/** Two-level name from the feed posters: light first name over a condensed surname. */
export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const last = parts.pop() ?? "";
  return { first: parts.join(" "), last };
}

/** 195 → `6'5" (195 cm)` */
export function formatHeight(cm: number | null): string | null {
  if (cm == null) return null;
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  return `${feet}'${totalInches % 12}" (${cm} cm)`;
}

/** Whole years between an ISO birth date and `now`. */
export function ageFrom(birthDate: string | null, now = new Date()): number | null {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) return null;
  const hadBirthday =
    now.getMonth() + 1 > month ||
    (now.getMonth() + 1 === month && now.getDate() >= day);
  return now.getFullYear() - year - (hadBirthday ? 0 : 1);
}

export function positionLabel(client: PublicRosterPlayer): string | null {
  if (client.kind === "coach") return "Coach";
  return client.categories[0]?.name ?? null;
}

/** Per-game average or shooting percentage; `—` when missing. */
export function formatStat(value: number | null | undefined, percent = false): string {
  if (value == null) return "—";
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return percent ? `${text}%` : text;
}

export { seasonEndYear };

/** First year a season starts: "2021-2024" → 2021, "2026" → 2026. */
function seasonStartYear(season: string): number {
  const first = season.match(/\d{4}/)?.[0];
  return first ? Number(first) : seasonEndYear(season);
}

/**
 * Newest first, whatever order Staff entered them in: by the year a season ends,
 * then the club Staff marked as current, then by the year it starts ("2026" before "2024-2026").
 */
export function sortCareer<
  T extends Pick<PublicRosterCareerEntry, "season"> & { isCurrent?: boolean },
>(career: T[]): T[] {
  return [...career].sort(
    (a, b) =>
      seasonEndYear(b.season) - seasonEndYear(a.season) ||
      Number(Boolean(b.isCurrent)) - Number(Boolean(a.isCurrent)) ||
      seasonStartYear(b.season) - seasonStartYear(a.season),
  );
}

/** "League · Country" of a career entry (either part may be missing). */
function leagueLabel(entry: { league: string | null; country: string | null }): string {
  return [entry.league?.trim(), entry.country?.trim()].filter(Boolean).join(" · ");
}

/** Same label whatever the separator or case: "LNBP - Mexico" = "lnbp · mexico". */
function labelKey(label: string): string {
  return label.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

/**
 * Leagues of earlier clubs as "League · Country", newest first (career is newest
 * first), once each, leaving out the current one: the current club's and the
 * Last league shown in the first tag.
 */
export function previousLeagues(client: PublicRosterPlayer): string[] {
  const current = new Set(
    [client.league ?? "", client.career[0] ? leagueLabel(client.career[0]) : ""]
      .map(labelKey)
      .filter(Boolean),
  );
  const byKey = new Map<string, string>();
  for (const entry of client.career.slice(1)) {
    const label = leagueLabel(entry);
    const key = labelKey(label);
    if (key && !current.has(key) && !byKey.has(key)) {
      byKey.set(key, label);
    }
  }
  return [...byKey.values()];
}

/**
 * The featured players that are still public, in their order, topped up with the
 * other public players (in list order) until there are `count`.
 */
export function pickFeatured<T extends { id: string }>(
  players: T[],
  featuredIds: readonly string[],
  count: number,
): T[] {
  const byId = new Map(players.map((player) => [player.id, player]));
  const featured = featuredIds.flatMap((id) => byId.get(id) ?? []);
  const rest = players.filter((player) => !featuredIds.includes(player.id));
  return [...featured, ...rest].slice(0, count);
}

import "server-only";

import {
  getInstagramToken,
  saveInstagramToken,
  type Database,
} from "@dtm/database";

import { ConflictError } from "@/utils/errors";

const GRAPH = "https://graph.instagram.com";
/** Long-lived Instagram tokens last 60 days from when they were issued or renewed. */
const LIFETIME_MS = 60 * 24 * 60 * 60 * 1000;

/**
 * Asks Instagram for a fresh 60-day token. It rejects tokens issued less than 24 hours
 * ago or already expired. Instagram's error text never contains the token.
 */
async function renew(token: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const response = await fetch(
    `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`Instagram refresh ${response.status}: ${await response.text()}`);
  }
  const body = (await response.json()) as { access_token: string; expires_in: number };
  return {
    accessToken: body.access_token,
    expiresAt: new Date(Date.now() + body.expires_in * 1000),
  };
}

/** Whole days until the token expires (0 once it has). */
export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((date.getTime() - now.getTime()) / 86_400_000));
}

/** Renews the saved token (the weekly cron and "Renew now"). */
export async function refreshInstagramToken(db: Database): Promise<Date> {
  const stored = await getInstagramToken(db);
  if (!stored) {
    throw new ConflictError("No Instagram token saved yet. Paste one first.");
  }
  const next = await renew(stored.accessToken);
  await saveInstagramToken(db, next.accessToken, next.expiresAt);
  return next.expiresAt;
}

/**
 * Saves a token the Owner pasted. It is renewed right away when Instagram allows it;
 * a token issued in the last 24 hours is only checked, and assumed to last 60 days.
 */
export async function replaceInstagramToken(db: Database, token: string): Promise<Date> {
  try {
    const next = await renew(token);
    await saveInstagramToken(db, next.accessToken, next.expiresAt);
    return next.expiresAt;
  } catch {
    const response = await fetch(
      `${GRAPH}/me?fields=id&access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      throw new ConflictError(
        "Instagram did not accept this token. Check that you copied all of it.",
      );
    }
    const expiresAt = new Date(Date.now() + LIFETIME_MS);
    await saveInstagramToken(db, token, expiresAt);
    return expiresAt;
  }
}

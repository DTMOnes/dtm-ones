import "server-only";

import { cookies } from "next/headers";
import { getRosterAccess, rosterAccessToken, verifyRosterPassword } from "@dtm/database";

import { db } from "@/lib/db";
import { PLAYERS_ACCESS_COOKIE } from "@/lib/roster/constants";

// Shared soft gate for the Clients list; the Owner sets the password in the dashboard
// (Settings). Profiles under /roster/[id] stay public on purpose.
/** Until a password is set in the dashboard, this one keeps working. */
const DEFAULT_PLAYERS_PASSWORD = "dtm-access";

async function storedHash(): Promise<string | null> {
  return (await getRosterAccess(db))?.passwordHash ?? null;
}

export async function isPlayersPassword(value: string): Promise<boolean> {
  const hash = await storedHash();
  return hash
    ? verifyRosterPassword(value, hash)
    : value.trim() === DEFAULT_PLAYERS_PASSWORD;
}

/** The cookie must match the current password, so changing it asks everyone again. */
export async function hasPlayersAccess(): Promise<boolean> {
  const cookie = (await cookies()).get(PLAYERS_ACCESS_COOKIE)?.value;
  return cookie === rosterAccessToken(await storedHash());
}

export async function revokePlayersAccess(): Promise<void> {
  (await cookies()).delete(PLAYERS_ACCESS_COOKIE);
}

export async function grantPlayersAccess(): Promise<void> {
  (await cookies()).set(PLAYERS_ACCESS_COOKIE, rosterAccessToken(await storedHash()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

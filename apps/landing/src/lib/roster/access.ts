import "server-only";

import { cookies } from "next/headers";

import { PLAYERS_ACCESS_COOKIE } from "@/lib/roster/constants";

// ponytail: provisional shared password requested by the agency; move to an env var
// (t3-env) or real accounts before treating it as more than a soft gate.
// Profiles under /roster/[id] stay public on purpose.
const PLAYERS_PASSWORD = "dtm-access";

export function isPlayersPassword(value: string): boolean {
  return value.trim() === PLAYERS_PASSWORD;
}

export async function hasPlayersAccess(): Promise<boolean> {
  return (await cookies()).get(PLAYERS_ACCESS_COOKIE)?.value === "1";
}

export async function grantPlayersAccess(): Promise<void> {
  (await cookies()).set(PLAYERS_ACCESS_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

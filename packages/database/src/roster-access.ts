import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { eq } from "drizzle-orm";

import type { Database } from "./db/client";
import { rosterAccess } from "./db/schema";

// The shared password that unlocks the landing Clients list. Staff change it in the
// dashboard; only a salted scrypt hash is stored ("scrypt$<salt>$<hash>", hex).

const KEY_LENGTH = 32;

export function hashRosterPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password.trim(), salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyRosterPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password.trim(), Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

/**
 * What the visitor's access cookie holds: derived from the stored hash, so setting a
 * new password turns every earlier unlock into a stale one.
 */
export function rosterAccessToken(storedHash: string | null): string {
  return createHash("sha256")
    .update(storedHash ?? "default")
    .digest("hex")
    .slice(0, 32);
}

export async function getRosterAccess(
  db: Database,
): Promise<{ passwordHash: string; updatedAt: Date } | null> {
  const [row] = await db
    .select({ passwordHash: rosterAccess.passwordHash, updatedAt: rosterAccess.updatedAt })
    .from(rosterAccess)
    .where(eq(rosterAccess.id, 1));
  return row ?? null;
}

/** Dashboard (Owner) only: the readable password. The landing role cannot read it. */
export async function getRosterPassword(db: Database): Promise<string | null> {
  const [row] = await db
    .select({ password: rosterAccess.password })
    .from(rosterAccess)
    .where(eq(rosterAccess.id, 1));
  return row?.password ?? null;
}

export async function setRosterPassword(db: Database, password: string): Promise<void> {
  const plain = password.trim();
  const passwordHash = hashRosterPassword(plain);
  await db
    .insert(rosterAccess)
    .values({ id: 1, passwordHash, password: plain })
    .onConflictDoUpdate({
      target: rosterAccess.id,
      set: { passwordHash, password: plain, updatedAt: new Date() },
    });
}

import { eq } from "drizzle-orm";

import type { Database } from "./db/client";
import { instagramToken } from "./db/schema";

export type InstagramTokenRow = {
  accessToken: string;
  expiresAt: Date;
  refreshedAt: Date;
};

export async function getInstagramToken(db: Database): Promise<InstagramTokenRow | null> {
  const [row] = await db
    .select({
      accessToken: instagramToken.accessToken,
      expiresAt: instagramToken.expiresAt,
      refreshedAt: instagramToken.refreshedAt,
    })
    .from(instagramToken)
    .where(eq(instagramToken.id, 1));
  return row ?? null;
}

export async function saveInstagramToken(
  db: Database,
  accessToken: string,
  expiresAt: Date,
): Promise<void> {
  const refreshedAt = new Date();
  await db
    .insert(instagramToken)
    .values({ id: 1, accessToken, expiresAt, refreshedAt })
    .onConflictDoUpdate({
      target: instagramToken.id,
      set: { accessToken, expiresAt, refreshedAt },
    });
}

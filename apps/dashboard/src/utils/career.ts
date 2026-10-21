import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

import { NotFoundError } from "./errors";

export type CareerEntry = {
  id: string;
  season: string;
  club: string;
  league: string | null;
  country: string | null;
  isCurrent: boolean;
};

export type Award = {
  id: string;
  title: string;
  detail: string | null;
  year: string | null;
  kind: "team" | "individual";
};

async function assertClient(db: Database, clientId: string): Promise<void> {
  const client = await db.query.clients.findFirst({
    columns: { id: true },
    where: and(
      eq(schema.clients.id, clientId),
      isNull(schema.clients.trashedAt),
    ),
  });

  if (!client) {
    throw new NotFoundError("Client");
  }
}

export async function getClientCareer(
  db: Database,
  clientId: string,
): Promise<{ career: CareerEntry[]; awards: Award[] }> {
  const [career, awards] = await Promise.all([
    db
      .select({
        id: schema.clientCareerEntries.id,
        season: schema.clientCareerEntries.season,
        club: schema.clientCareerEntries.club,
        league: schema.clientCareerEntries.league,
        country: schema.clientCareerEntries.country,
        isCurrent: schema.clientCareerEntries.isCurrent,
      })
      .from(schema.clientCareerEntries)
      .where(eq(schema.clientCareerEntries.clientId, clientId))
      .orderBy(
        asc(schema.clientCareerEntries.sortOrder),
        asc(schema.clientCareerEntries.createdAt),
      ),
    db
      .select({
        id: schema.clientAwards.id,
        title: schema.clientAwards.title,
        detail: schema.clientAwards.detail,
        year: schema.clientAwards.year,
        kind: schema.clientAwards.kind,
      })
      .from(schema.clientAwards)
      .where(eq(schema.clientAwards.clientId, clientId))
      .orderBy(
        asc(schema.clientAwards.sortOrder),
        asc(schema.clientAwards.createdAt),
      ),
  ]);

  return { career, awards };
}

/** New entries go last; the landing lists them in this order. */
export async function addCareerEntry(
  db: Database,
  clientId: string,
  entry: Omit<CareerEntry, "id" | "isCurrent">,
): Promise<void> {
  await assertClient(db, clientId);

  const [{ value: sortOrder } = { value: 0 }] = await db
    .select({ value: count() })
    .from(schema.clientCareerEntries)
    .where(eq(schema.clientCareerEntries.clientId, clientId));

  await db
    .insert(schema.clientCareerEntries)
    .values({ clientId, sortOrder, ...entry });
}

export async function removeCareerEntry(
  db: Database,
  clientId: string,
  entryId: string,
): Promise<void> {
  const [row] = await db
    .delete(schema.clientCareerEntries)
    .where(
      and(
        eq(schema.clientCareerEntries.id, entryId),
        eq(schema.clientCareerEntries.clientId, clientId),
      ),
    )
    .returning({ id: schema.clientCareerEntries.id });

  if (!row) {
    throw new NotFoundError("Career entry");
  }
}

/** Marks one entry as the current club and clears the rest; null clears them all. */
export async function setCurrentCareerEntry(
  db: Database,
  clientId: string,
  entryId: string | null,
): Promise<void> {
  // One UPDATE, so the Client never ends up with two current clubs.
  const rows = await db
    .update(schema.clientCareerEntries)
    .set({
      isCurrent: entryId
        ? sql`${schema.clientCareerEntries.id} = ${entryId}`
        : false,
    })
    .where(eq(schema.clientCareerEntries.clientId, clientId))
    .returning({
      id: schema.clientCareerEntries.id,
      isCurrent: schema.clientCareerEntries.isCurrent,
    });

  if (entryId && !rows.some((row) => row.isCurrent)) {
    throw new NotFoundError("Career entry");
  }
}

export async function addAward(
  db: Database,
  clientId: string,
  award: Omit<Award, "id">,
): Promise<void> {
  await assertClient(db, clientId);

  const [{ value: sortOrder } = { value: 0 }] = await db
    .select({ value: count() })
    .from(schema.clientAwards)
    .where(eq(schema.clientAwards.clientId, clientId));

  await db.insert(schema.clientAwards).values({ clientId, sortOrder, ...award });
}

export async function removeAward(
  db: Database,
  clientId: string,
  awardId: string,
): Promise<void> {
  const [row] = await db
    .delete(schema.clientAwards)
    .where(
      and(
        eq(schema.clientAwards.id, awardId),
        eq(schema.clientAwards.clientId, clientId),
      ),
    )
    .returning({ id: schema.clientAwards.id });

  if (!row) {
    throw new NotFoundError("Award");
  }
}

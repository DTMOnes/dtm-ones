import { and, asc, eq, isNull } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

import type { Coach, CoachVisibility } from "@/types/coach";
import { ConflictError, NotFoundError } from "@/utils/errors";

export type CoachWrite = {
  name: string;
  nationality: string;
  lastClub: string;
  eurobasketLink?: string | null;
};

export type CoachPatch = Partial<CoachWrite>;

type CoachCompletenessInput = {
  name: string | null;
  nationality: string | null;
  lastClub: string | null;
  eurobasketLink: string | null;
  presentationImageUrl: string | null;
  gallery: { length: number };
};

export function coachCompletenessGaps(
  coach: CoachCompletenessInput,
): string[] {
  const gaps: string[] = [];

  if (!coach.name?.trim()) {
    gaps.push("Name");
  }
  if (!coach.nationality?.trim()) {
    gaps.push("Nationality");
  }
  if (!coach.lastClub?.trim()) {
    gaps.push("Last club");
  }
  if (!coach.eurobasketLink?.trim()) {
    gaps.push("Eurobasket link");
  }
  if (!coach.presentationImageUrl) {
    gaps.push("Presentation image");
  }
  if (coach.gallery.length === 0) {
    gaps.push("Gallery image");
  }

  return gaps;
}

export function isCoachComplete(coach: CoachCompletenessInput): boolean {
  return coachCompletenessGaps(coach).length === 0;
}

export async function getCoach(db: Database, id: string): Promise<Coach | null> {
  const row = await db.query.clients.findFirst({
    columns: {
      id: true,
      name: true,
      nationality: true,
      lastClub: true,
      eurobasketLink: true,
      visibility: true,
      presentationImageUrl: true,
    },
    where: and(
      eq(schema.clients.id, id),
      eq(schema.clients.kind, "coach"),
      isNull(schema.clients.trashedAt),
    ),
    with: {
      galleryImages: {
        columns: {
          id: true,
          url: true,
        },
        orderBy: [
          asc(schema.playerGalleryImages.sortOrder),
          asc(schema.playerGalleryImages.createdAt),
        ],
      },
    },
  });

  if (!row) {
    return null;
  }

  const { galleryImages, ...coach } = row;
  return {
    ...coach,
    gallery: galleryImages,
  };
}

export async function createCoach(
  db: Database,
  input: CoachWrite,
): Promise<Coach> {
  const [row] = await db
    .insert(schema.clients)
    .values({
      kind: "coach",
      name: input.name,
      nationality: input.nationality,
      lastClub: input.lastClub,
      visibility: "private",
      eurobasketLink: input.eurobasketLink ?? null,
    })
    .returning({ id: schema.clients.id });

  if (!row) {
    throw new Error("createCoach returned no row");
  }

  const coach = await getCoach(db, row.id);
  if (!coach) {
    throw new Error("createCoach could not load coach");
  }

  return coach;
}

export async function updateCoach(
  db: Database,
  id: string,
  patch: CoachPatch,
): Promise<Coach> {
  const existing = await getCoach(db, id);
  if (!existing) {
    throw new NotFoundError("Coach");
  }

  const next = {
    name: patch.name ?? existing.name,
    nationality: patch.nationality ?? existing.nationality,
    lastClub: patch.lastClub ?? existing.lastClub,
    eurobasketLink:
      patch.eurobasketLink === undefined
        ? existing.eurobasketLink
        : patch.eurobasketLink,
    presentationImageUrl: existing.presentationImageUrl,
    gallery: existing.gallery,
  };

  if (existing.visibility === "public" && !isCoachComplete(next)) {
    throw new ConflictError(
      "A Coach cannot be public unless the profile is complete.",
    );
  }

  await db
    .update(schema.clients)
    .set({
      name: next.name,
      nationality: next.nationality,
      lastClub: next.lastClub,
      eurobasketLink: next.eurobasketLink,
      updatedAt: new Date(),
    })
    .where(eq(schema.clients.id, id));

  const coach = await getCoach(db, id);
  if (!coach) {
    throw new NotFoundError("Coach");
  }

  return coach;
}

export async function setCoachVisibility(
  db: Database,
  id: string,
  visibility: CoachVisibility,
): Promise<Coach> {
  const existing = await getCoach(db, id);
  if (!existing) {
    throw new NotFoundError("Coach");
  }

  if (visibility === "public" && !isCoachComplete(existing)) {
    throw new ConflictError(
      "A Coach cannot be public unless the profile is complete.",
    );
  }

  await db
    .update(schema.clients)
    .set({ visibility, updatedAt: new Date() })
    .where(eq(schema.clients.id, id));

  const coach = await getCoach(db, id);
  if (!coach) {
    throw new NotFoundError("Coach");
  }

  return coach;
}

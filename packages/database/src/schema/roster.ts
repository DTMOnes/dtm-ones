import { and, eq, isNull } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";

import { clients } from "./clients";

export const roster = pgView("roster").as((qb) =>
  qb
    .select({
      id: clients.id,
      kind: clients.kind,
      name: clients.name,
      nationality: clients.nationality,
      lastClub: clients.lastClub,
      visibility: clients.visibility,
      heightCm: clients.heightCm,
      categoryId: clients.categoryId,
      presentationImageUrl: clients.presentationImageUrl,
      presentationImageKey: clients.presentationImageKey,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    })
    .from(clients)
    .where(and(eq(clients.visibility, "public"), isNull(clients.trashedAt))),
);

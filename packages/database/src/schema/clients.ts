import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { categories } from "./categories";
import { clientKind, clientVisibility } from "./enums";

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: clientKind("kind").notNull(),
    name: text("name").notNull(),
    nationality: text("nationality").notNull(),
    lastClub: text("last_club").notNull(),
    visibility: clientVisibility("visibility").notNull().default("private"),
    trashedAt: timestamp("trashed_at", { withTimezone: true }),
    heightCm: integer("height_cm"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),
    presentationImageUrl: text("presentation_image_url"),
    presentationImageKey: text("presentation_image_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("clients_id_kind_key").on(table.id, table.kind),
    check(
      "clients_coach_has_no_player_facts",
      sql`${table.kind} <> 'coach' OR (
        ${table.heightCm} IS NULL
        AND ${table.categoryId} IS NULL
        AND ${table.presentationImageUrl} IS NULL
        AND ${table.presentationImageKey} IS NULL
      )`,
    ),
  ],
);

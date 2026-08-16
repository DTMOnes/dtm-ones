import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { clientKind } from "./enums";

export const playerGalleryImages = pgTable(
  "player_gallery_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull(),
    clientKind: clientKind("client_kind").notNull().default("player"),
    url: text("url").notNull(),
    storageKey: text("storage_key"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "player_gallery_images_kind_player",
      sql`${table.clientKind} = 'player'`,
    ),
    foreignKey({
      columns: [table.clientId, table.clientKind],
      foreignColumns: [clients.id, clients.kind],
      name: "player_gallery_images_client_fkey",
    }).onDelete("cascade"),
  ],
);

export const playerVideos = pgTable(
  "player_videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull(),
    clientKind: clientKind("client_kind").notNull().default("player"),
    youtubeUrl: text("youtube_url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("player_videos_kind_player", sql`${table.clientKind} = 'player'`),
    foreignKey({
      columns: [table.clientId, table.clientKind],
      foreignColumns: [clients.id, clients.kind],
      name: "player_videos_client_fkey",
    }).onDelete("cascade"),
  ],
);

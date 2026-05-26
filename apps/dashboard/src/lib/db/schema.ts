import {
  pgTable,
  pgEnum,
  serial,
  uuid,
  text,
  integer,
  varchar,
  timestamp,
  boolean,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const contactRequest = pgTable("contact_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  height: varchar("height", { length: 20 }).notNull(),
  dateOfBirth: varchar("date_of_birth", { length: 50 }).notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),
  lastClub: varchar("last_club", { length: 150 }).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const playersRelations = relations(players, ({ many }) => ({
  playerCategories: many(playerCategories),
  playerMedia: many(playerMedia),
}));

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  playerCategories: many(playerCategories),
}));

export const playerCategories = pgTable(
  "player_categories",
  {
    playerId: uuid("player_id")
      .references(() => players.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.playerId, t.categoryId] })],
);

export const playerCategoriesRelations = relations(
  playerCategories,
  ({ one }) => ({
    player: one(players, {
      fields: [playerCategories.playerId],
      references: [players.id],
    }),
    category: one(categories, {
      fields: [playerCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const playerMediaTypes = pgEnum("player_media_types", [
  "image",
  "video",
]);

export const playerMedia = pgTable("player_media", {
  id: uuid("id").primaryKey(),
  playerId: uuid("player_id")
    .references(() => players.id, { onDelete: "cascade" })
    .notNull(),
  mediaType: playerMediaTypes("media_type").notNull(),
  mimeType: text("mime_type").notNull(),
  storagePath: text("storage_path").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const playerMediaRelations = relations(playerMedia, ({ one }) => ({
  player: one(players, {
    fields: [playerMedia.playerId],
    references: [players.id],
  }),
}));

export const landingMediaTypes = pgEnum("landing_media_types", [
  "image",
  "video",
]);

export const landingMedia = pgTable("landing_media", {
  id: uuid("id").primaryKey(),
  mediaType: landingMediaTypes("media_type").notNull(),
  mimeType: text("mime_type").notNull(),
  storagePath: text("storage_path").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

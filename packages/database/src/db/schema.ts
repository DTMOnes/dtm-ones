import { and, eq, isNull, relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  pgView,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const clientKind = pgEnum("client_kind", ["player", "coach"]);

export const clientVisibility = pgEnum("client_visibility", ["public", "private"]);

export const contactRequestReason = pgEnum("contact_request_reason", [
  "seeking_representation",
  "looking_for_a_player",
]);

export const contactRequestStatus = pgEnum("contact_request_status", [
  "new",
  "read",
  "archived",
]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_name_lower_key").on(sql`lower(${table.name})`),
  ],
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: clientKind("kind").notNull(),
    name: text("name").notNull(),
    nationality: text("nationality").notNull(),
    lastClub: text("last_club").notNull(),
    eurobasketLink: text("eurobasket_link"),
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

export const roster = pgView("roster").as((qb) =>
  qb
    .select({
      id: clients.id,
      kind: clients.kind,
      name: clients.name,
      nationality: clients.nationality,
      lastClub: clients.lastClub,
      eurobasketLink: clients.eurobasketLink,
      visibility: clients.visibility,
      heightCm: clients.heightCm,
      categoryId: clients.categoryId,
      categoryName: sql<string | null>`${categories.name}`.as("category_name"),
      presentationImageUrl: clients.presentationImageUrl,
      presentationImageKey: clients.presentationImageKey,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    })
    .from(clients)
    .leftJoin(categories, eq(clients.categoryId, categories.id))
    .where(and(eq(clients.visibility, "public"), isNull(clients.trashedAt))),
);

export const rosterGalleryImages = pgView("roster_gallery_images").as((qb) =>
  qb
    .select({
      id: playerGalleryImages.id,
      clientId: playerGalleryImages.clientId,
      url: playerGalleryImages.url,
      sortOrder: playerGalleryImages.sortOrder,
    })
    .from(playerGalleryImages)
    .innerJoin(clients, eq(playerGalleryImages.clientId, clients.id))
    .where(and(eq(clients.visibility, "public"), isNull(clients.trashedAt))),
);

export const rosterVideos = pgView("roster_videos").as((qb) =>
  qb
    .select({
      id: playerVideos.id,
      clientId: playerVideos.clientId,
      youtubeUrl: playerVideos.youtubeUrl,
      sortOrder: playerVideos.sortOrder,
    })
    .from(playerVideos)
    .innerJoin(clients, eq(playerVideos.clientId, clients.id))
    .where(and(eq(clients.visibility, "public"), isNull(clients.trashedAt))),
);

export const contactRequests = pgTable("contact_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  reason: contactRequestReason("reason").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: contactRequestStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const betterAuthSchema = pgSchema("better_auth");

export const user = betterAuthSchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
});

export const session = betterAuthSchema.table("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = betterAuthSchema.table("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const verification = betterAuthSchema.table("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  players: many(clients),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  category: one(categories, {
    fields: [clients.categoryId],
    references: [categories.id],
  }),
  galleryImages: many(playerGalleryImages),
  videos: many(playerVideos),
}));

export const playerGalleryImagesRelations = relations(
  playerGalleryImages,
  ({ one }) => ({
    client: one(clients, {
      fields: [playerGalleryImages.clientId, playerGalleryImages.clientKind],
      references: [clients.id, clients.kind],
    }),
  }),
);

export const playerVideosRelations = relations(playerVideos, ({ one }) => ({
  client: one(clients, {
    fields: [playerVideos.clientId, playerVideos.clientKind],
    references: [clients.id, clients.kind],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

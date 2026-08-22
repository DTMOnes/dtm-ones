import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";

import { createDatabase } from "./client";
import {
  categories,
  clients,
  playerGalleryImages,
  playerVideos,
  roster,
} from "./schema";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");
config({ path: path.join(root, ".env") });

const connectionString = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or TEST_DATABASE_URL is required");
}

const db = createDatabase(connectionString);

before(async () => {
  await db.execute(sql`select 1`);
});

beforeEach(async () => {
  await db.execute(
    sql`truncate table player_gallery_images, player_videos, clients, categories restart identity cascade`,
  );
});

function coachValues() {
  return {
    kind: "coach" as const,
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
    visibility: "private" as const,
  };
}

function playerValues() {
  return {
    kind: "player" as const,
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    visibility: "private" as const,
    heightCm: 198,
  };
}

function eurobasketLink() {
  return "https://basketball.eurobasket.com/player/Manu-Ginobili/123";
}

function publicPlayerValues() {
  return {
    ...playerValues(),
    visibility: "public" as const,
    eurobasketLink: eurobasketLink(),
  };
}

async function insertCategory(name: string) {
  const [row] = await db
    .insert(categories)
    .values({ name, slug: slugify(name) })
    .returning({ id: categories.id });

  if (!row) {
    throw new Error("insertCategory returned no row");
  }

  return row;
}

async function insertClient(values: typeof clients.$inferInsert) {
  const [row] = await db.insert(clients).values(values).returning({
    id: clients.id,
    name: clients.name,
    categoryId: clients.categoryId,
  });

  if (!row) {
    throw new Error("insertClient returned no row");
  }

  return row;
}

function postgresError(error: unknown): object | null {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ("code" in current && typeof current.code === "string") {
      return current;
    }
    current = "cause" in current ? current.cause : undefined;
  }
  return null;
}

function isCheckViolation(error: unknown, constraint: string): boolean {
  const pgError = postgresError(error);
  if (!pgError) {
    return false;
  }

  const code = "code" in pgError ? pgError.code : undefined;
  const namedConstraint =
    "constraint" in pgError ? pgError.constraint : undefined;
  const message = "message" in pgError ? String(pgError.message) : "";

  return (
    code === "23514" &&
    (namedConstraint === constraint || message.includes(constraint))
  );
}

function isForeignKeyViolation(error: unknown): boolean {
  const pgError = postgresError(error);
  if (!pgError) {
    return false;
  }

  const code = "code" in pgError ? pgError.code : undefined;
  const message = "message" in pgError ? String(pgError.message) : "";

  return (
    code === "23503" ||
    message.includes("foreign key") ||
    message.includes("player_gallery_images_client_fkey") ||
    message.includes("player_videos_client_fkey")
  );
}

function isNotNullViolation(error: unknown): boolean {
  const pgError = postgresError(error);
  if (!pgError) {
    return false;
  }

  const code = "code" in pgError ? pgError.code : undefined;
  return code === "23502";
}

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "category";
}

test("a Client can omit name, nationality, and last club", async () => {
  const row = await insertClient({ kind: "player" });

  const [stored] = await db
    .select({
      name: clients.name,
      nationality: clients.nationality,
      lastClub: clients.lastClub,
      kind: clients.kind,
    })
    .from(clients)
    .where(eq(clients.id, row.id));

  assert.equal(stored?.kind, "player");
  assert.equal(stored?.name, null);
  assert.equal(stored?.nationality, null);
  assert.equal(stored?.lastClub, null);
});

test("kind is required and Visibility defaults to private", async () => {
  await assert.rejects(
    () =>
      db.execute(
        sql`insert into clients (kind, visibility) values (null, 'private')`,
      ),
    isNotNullViolation,
  );

  const row = await insertClient({ kind: "coach" });
  const [stored] = await db
    .select({ visibility: clients.visibility })
    .from(clients)
    .where(eq(clients.id, row.id));

  assert.equal(stored?.visibility, "private");
});

test("a Coach can store a presentation image and gallery", async () => {
  const coach = await insertClient({
    ...coachValues(),
    presentationImageUrl: "https://example.com/coach.jpg",
    presentationImageKey: "clients/coach.jpg",
  });

  const [stored] = await db
    .select({
      presentationImageUrl: clients.presentationImageUrl,
      presentationImageKey: clients.presentationImageKey,
    })
    .from(clients)
    .where(eq(clients.id, coach.id));

  assert.equal(stored?.presentationImageUrl, "https://example.com/coach.jpg");
  assert.equal(stored?.presentationImageKey, "clients/coach.jpg");

  const [gallery] = await db
    .insert(playerGalleryImages)
    .values({
      clientId: coach.id,
      clientKind: "coach",
      url: "https://example.com/gallery.jpg",
    })
    .returning({ url: playerGalleryImages.url });

  assert.equal(gallery?.url, "https://example.com/gallery.jpg");
});

test("a Coach cannot store height, Category, or videos", async () => {
  const category = await insertCategory("Guards");
  const coach = await insertClient(coachValues());

  await assert.rejects(
    () => insertClient({ ...coachValues(), heightCm: 185 }),
    (error: unknown) =>
      isCheckViolation(error, "clients_coach_has_no_player_facts"),
  );
  await assert.rejects(
    () => insertClient({ ...coachValues(), categoryId: category.id }),
    (error: unknown) =>
      isCheckViolation(error, "clients_coach_has_no_player_facts"),
  );
  await assert.rejects(
    () =>
      db.insert(playerVideos).values({
        clientId: coach.id,
        clientKind: "player",
        youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      }),
    isForeignKeyViolation,
  );
  await assert.rejects(
    () =>
      db.insert(playerVideos).values({
        clientId: coach.id,
        clientKind: "coach",
        youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      }),
    (error: unknown) => isCheckViolation(error, "player_videos_kind_player"),
  );
});

test("a Player can store height, Category, presentation image, gallery, and videos", async () => {
  const guards = await insertCategory("Guards");
  const player = await insertClient({
    ...playerValues(),
    categoryId: guards.id,
    presentationImageUrl: "https://example.com/manu.jpg",
    presentationImageKey: "clients/manu.jpg",
  });

  const [gallery] = await db
    .insert(playerGalleryImages)
    .values({
      clientId: player.id,
      clientKind: "player",
      url: "https://example.com/gallery.jpg",
    })
    .returning({ url: playerGalleryImages.url });
  const [video] = await db
    .insert(playerVideos)
    .values({
      clientId: player.id,
      clientKind: "player",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    })
    .returning({ youtubeUrl: playerVideos.youtubeUrl });

  const [stored] = await db
    .select({
      heightCm: clients.heightCm,
      categoryId: clients.categoryId,
      presentationImageUrl: clients.presentationImageUrl,
    })
    .from(clients)
    .where(eq(clients.id, player.id));

  assert.equal(stored?.heightCm, 198);
  assert.equal(stored?.categoryId, guards.id);
  assert.equal(stored?.presentationImageUrl, "https://example.com/manu.jpg");
  assert.equal(gallery?.url, "https://example.com/gallery.jpg");
  assert.equal(video?.youtubeUrl, "https://youtube.com/watch?v=dQw4w9WgXcQ");
});

test("a Player has at most one Category", async () => {
  const guards = await insertCategory("Guards");

  const player = await insertClient({
    ...playerValues(),
    categoryId: guards.id,
  });

  const [row] = await db
    .select({ categoryId: clients.categoryId })
    .from(clients)
    .where(eq(clients.id, player.id));

  assert.equal(row?.categoryId, guards.id);
});

test("a Coach can have a Eurobasket link", async () => {
  await insertClient({
    ...coachValues(),
    name: "Public Coach",
    visibility: "public",
    eurobasketLink: "https://basketball.eurobasket.com/coach/Pat-Riley/1",
  });

  const [row] = await db
    .select({
      name: roster.name,
      eurobasketLink: roster.eurobasketLink,
    })
    .from(roster);

  assert.equal(row?.name, "Public Coach");
  assert.equal(
    row?.eurobasketLink,
    "https://basketball.eurobasket.com/coach/Pat-Riley/1",
  );
});

test("a private Client is not on the Roster", async () => {
  await insertClient({
    ...publicPlayerValues(),
    name: "Public Player",
  });
  await insertClient({
    ...coachValues(),
    name: "Private Coach",
    visibility: "private",
  });

  const names = (await db.select({ name: roster.name }).from(roster)).map(
    (row) => row.name,
  );
  assert.deepEqual(names, ["Public Player"]);
});

test("a Client in the Trash is not on the Roster", async () => {
  await insertClient({
    ...publicPlayerValues(),
    name: "Public Player",
  });
  const trashed = await insertClient({
    ...publicPlayerValues(),
    name: "Trashed Player",
  });

  await db
    .update(clients)
    .set({ trashedAt: new Date(), updatedAt: new Date() })
    .where(eq(clients.id, trashed.id));

  const names = (await db.select({ name: roster.name }).from(roster)).map(
    (row) => row.name,
  );
  assert.deepEqual(names, ["Public Player"]);
});

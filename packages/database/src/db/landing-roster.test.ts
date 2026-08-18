import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";

import { createDatabase, type Database } from "./client";
import { ensureTestLandingRole } from "./landing-role";
import {
  getPublicRosterPlayer,
  listPublicRosterCategories,
  listPublicRosterPlayers,
} from "./roster";
import {
  categories,
  clients,
  contactRequests,
  playerGalleryImages,
  playerVideos,
  roster,
  rosterGalleryImages,
  session,
  user,
} from "./schema";

const root = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../../..",
);
config({ path: path.join(root, ".env") });

const connectionString =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or TEST_DATABASE_URL is required");
}

const db = createDatabase(connectionString);
let landingDb: Database;

before(async () => {
  await db.execute(sql`select 1`);
  const landingUrl = await ensureTestLandingRole(db, connectionString);
  landingDb = createDatabase(landingUrl);
});

beforeEach(async () => {
  await db.execute(
    sql`truncate table player_gallery_images, player_videos, clients, categories restart identity cascade`,
  );
});

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

function isPermissionDenied(error: unknown): boolean {
  const pgError = postgresError(error);
  if (pgError && "code" in pgError && pgError.code === "42501") {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /permission denied/i.test(message);
}

function eurobasketLink() {
  return "https://basketball.eurobasket.com/player/Manu-Ginobili/123";
}

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "category";
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

async function insertPlayer(values: {
  name: string;
  visibility: "public" | "private";
  categoryId?: string;
  trashedAt?: Date;
}) {
  const [row] = await db
    .insert(clients)
    .values({
      kind: "player",
      name: values.name,
      nationality: "Argentina",
      lastClub: "San Antonio Spurs",
      visibility: values.visibility,
      eurobasketLink: eurobasketLink(),
      heightCm: 198,
      categoryId: values.categoryId,
      presentationImageUrl: "https://example.com/manu.jpg",
      trashedAt: values.trashedAt,
    })
    .returning({ id: clients.id, name: clients.name });

  if (!row) {
    throw new Error("insertPlayer returned no row");
  }

  return row;
}

test("landing role can read the Roster", async () => {
  const category = await insertCategory("Guards");
  await insertPlayer({
    name: "Manu Ginobili",
    visibility: "public",
    categoryId: category.id,
  });

  const names = (await landingDb.select({ name: roster.name }).from(roster)).map(
    (row) => row.name,
  );
  assert.deepEqual(names, ["Manu Ginobili"]);
});

test("landing role cannot read private Clients, Users, or the inbox", async () => {
  await assert.rejects(
    () => landingDb.select({ id: clients.id }).from(clients),
    isPermissionDenied,
  );
  await assert.rejects(
    () => landingDb.select({ id: user.id }).from(user),
    isPermissionDenied,
  );
  await assert.rejects(
    () => landingDb.select({ id: session.id }).from(session),
    isPermissionDenied,
  );
  await assert.rejects(
    () => landingDb.select({ id: contactRequests.id }).from(contactRequests),
    isPermissionDenied,
  );
  await assert.rejects(
    () =>
      landingDb
        .select({ id: playerGalleryImages.id })
        .from(playerGalleryImages),
    isPermissionDenied,
  );
});

test("landing role can insert a ContactRequest and cannot read it back", async () => {
  const email = `landing-role-${Date.now()}@example.com`;

  await landingDb.insert(contactRequests).values({
    reason: "seeking_representation",
    email,
    phone: "+10000000000",
    message: "I want representation.",
  });

  await assert.rejects(
    () =>
      landingDb
        .select({ id: contactRequests.id })
        .from(contactRequests)
        .where(eq(contactRequests.email, email)),
    isPermissionDenied,
  );

  const rows = await db
    .select({ email: contactRequests.email })
    .from(contactRequests)
    .where(eq(contactRequests.email, email));
  assert.deepEqual(
    rows.map((row) => row.email),
    [email],
  );

  await db.delete(contactRequests).where(eq(contactRequests.email, email));
});

test("a private Client is not on the Roster", async () => {
  const category = await insertCategory("Guards");
  await insertPlayer({
    name: "Public Player",
    visibility: "public",
    categoryId: category.id,
  });
  await insertPlayer({
    name: "Private Player",
    visibility: "private",
    categoryId: category.id,
  });

  const names = (await listPublicRosterPlayers(landingDb)).map(
    (player) => player.name,
  );
  assert.deepEqual(names, ["Public Player"]);
});

test("a Client in the Trash is not on the Roster", async () => {
  const category = await insertCategory("Guards");
  await insertPlayer({
    name: "Public Player",
    visibility: "public",
    categoryId: category.id,
  });
  await insertPlayer({
    name: "Trashed Player",
    visibility: "public",
    categoryId: category.id,
    trashedAt: new Date(),
  });

  const names = (await listPublicRosterPlayers(landingDb)).map(
    (player) => player.name,
  );
  assert.deepEqual(names, ["Public Player"]);
});

test("a public Coach is not listed as a Player", async () => {
  const category = await insertCategory("Guards");
  await insertPlayer({
    name: "Manu Ginobili",
    visibility: "public",
    categoryId: category.id,
  });
  await db.insert(clients).values({
    kind: "coach",
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
    visibility: "public",
    eurobasketLink: "https://basketball.eurobasket.com/coach/Pat-Riley/1",
  });

  const names = (await listPublicRosterPlayers(landingDb)).map(
    (player) => player.name,
  );
  assert.deepEqual(names, ["Manu Ginobili"]);
});

test("Roster search and Category filter match public Players", async () => {
  const guards = await insertCategory("Guards");
  const forwards = await insertCategory("Forwards");
  await insertPlayer({
    name: "Manu Ginobili",
    visibility: "public",
    categoryId: guards.id,
  });
  await insertPlayer({
    name: "Luis Scola",
    visibility: "public",
    categoryId: forwards.id,
  });

  const search = await listPublicRosterPlayers(landingDb, { q: "Ginobili" });
  assert.deepEqual(
    search.map((player) => player.name),
    ["Manu Ginobili"],
  );

  const filtered = await listPublicRosterPlayers(landingDb, {
    categoryIds: [forwards.id],
  });
  assert.deepEqual(
    filtered.map((player) => player.name),
    ["Luis Scola"],
  );

  const rosterCategories = await listPublicRosterCategories(landingDb);
  assert.deepEqual(
    rosterCategories.map((category) => category.name),
    ["Forwards", "Guards"],
  );
});

test("a public Player with an empty gallery is still on the Roster", async () => {
  const category = await insertCategory("Guards");
  const player = await insertPlayer({
    name: "Manu Ginobili",
    visibility: "public",
    categoryId: category.id,
  });

  const retrieved = await getPublicRosterPlayer(landingDb, player.id);
  assert.equal(retrieved?.name, "Manu Ginobili");
  assert.equal(retrieved?.categoryName, "Guards");
  assert.deepEqual(retrieved?.gallery, []);
  assert.deepEqual(retrieved?.videos, []);
});

test("a public Player's gallery and videos are on the Roster", async () => {
  const category = await insertCategory("Guards");
  const player = await insertPlayer({
    name: "Manu Ginobili",
    visibility: "public",
    categoryId: category.id,
  });

  await db.insert(playerGalleryImages).values({
    clientId: player.id,
    clientKind: "player",
    url: "https://example.com/gallery.jpg",
    sortOrder: 0,
  });
  await db.insert(playerVideos).values({
    clientId: player.id,
    clientKind: "player",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sortOrder: 0,
  });

  const retrieved = await getPublicRosterPlayer(landingDb, player.id);
  assert.equal(retrieved?.gallery[0]?.url, "https://example.com/gallery.jpg");
  assert.equal(
    retrieved?.videos[0]?.youtubeUrl,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  );
});

test("gallery of a private Player is not on the Roster", async () => {
  const category = await insertCategory("Guards");
  const publicPlayer = await insertPlayer({
    name: "Public Player",
    visibility: "public",
    categoryId: category.id,
  });
  const privatePlayer = await insertPlayer({
    name: "Private Player",
    visibility: "private",
    categoryId: category.id,
  });

  await db.insert(playerGalleryImages).values({
    clientId: publicPlayer.id,
    clientKind: "player",
    url: "https://example.com/public.jpg",
  });
  await db.insert(playerGalleryImages).values({
    clientId: privatePlayer.id,
    clientKind: "player",
    url: "https://example.com/secret.jpg",
  });

  const urls = (
    await landingDb
      .select({ url: rosterGalleryImages.url })
      .from(rosterGalleryImages)
  ).map((row) => row.url);
  assert.deepEqual(urls, ["https://example.com/public.jpg"]);
});

test("a private Player is not retrievable on the Roster", async () => {
  const category = await insertCategory("Guards");
  const player = await insertPlayer({
    name: "Private Player",
    visibility: "private",
    categoryId: category.id,
  });

  assert.equal(await getPublicRosterPlayer(landingDb, player.id), null);
});

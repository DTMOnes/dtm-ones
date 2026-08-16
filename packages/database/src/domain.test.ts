import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { sql } from "drizzle-orm";

import { createDatabase } from "./client";
import { createDomain, type Domain } from "./domain";
import { DomainError } from "./errors";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
config({ path: path.join(root, ".env") });

const connectionString = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or TEST_DATABASE_URL is required");
}

const db = createDatabase(connectionString);
const domain: Domain = createDomain(db);

before(async () => {
  await db.execute(sql`select 1`);
});

beforeEach(async () => {
  await db.execute(
    sql`truncate table player_gallery_images, player_videos, clients, categories restart identity cascade`,
  );
});

function coachInput() {
  return {
    kind: "coach" as const,
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
    visibility: "private" as const,
  };
}

function playerInput() {
  return {
    kind: "player" as const,
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    visibility: "private" as const,
    heightCm: 198,
  };
}

function isPlayerFactsOnCoach(error: unknown): boolean {
  return error instanceof DomainError && error.code === "player_facts_on_coach";
}

test("a Coach cannot store Player facts", async () => {
  const category = await domain.createCategory({ name: "Guards" });

  await assert.rejects(
    () => domain.storeClient({ ...coachInput(), heightCm: 185 }),
    isPlayerFactsOnCoach,
  );
  await assert.rejects(
    () => domain.storeClient({ ...coachInput(), categoryIds: [category.id] }),
    isPlayerFactsOnCoach,
  );
  await assert.rejects(
    () =>
      domain.storeClient({
        ...coachInput(),
        presentationImageUrl: "https://example.com/coach.jpg",
      }),
    isPlayerFactsOnCoach,
  );
  await assert.rejects(
    () =>
      domain.storeClient({
        ...coachInput(),
        gallery: [{ url: "https://example.com/gallery.jpg" }],
      }),
    isPlayerFactsOnCoach,
  );
  await assert.rejects(
    () =>
      domain.storeClient({
        ...coachInput(),
        videos: [{ youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ" }],
      }),
    isPlayerFactsOnCoach,
  );
});

test("a Player has at most one Category", async () => {
  const guards = await domain.createCategory({ name: "Guards" });
  const forwards = await domain.createCategory({ name: "Forwards" });

  await assert.rejects(
    () =>
      domain.storeClient({
        ...playerInput(),
        categoryIds: [guards.id, forwards.id],
      }),
    (error: unknown) =>
      error instanceof DomainError &&
      error.code === "player_has_at_most_one_category",
  );
});

test("a private Client is not on the Roster", async () => {
  await domain.storeClient({
    ...playerInput(),
    name: "Public Player",
    visibility: "public",
  });
  await domain.storeClient({
    ...coachInput(),
    name: "Private Coach",
    visibility: "private",
  });

  const names = (await domain.listRoster()).map((client) => client.name);
  assert.deepEqual(names, ["Public Player"]);
});

test("a Client in the Trash is not on the Roster", async () => {
  await domain.storeClient({
    ...playerInput(),
    name: "Public Player",
    visibility: "public",
  });
  const trashed = await domain.storeClient({
    ...playerInput(),
    name: "Trashed Player",
    visibility: "public",
  });
  await domain.trashClient(trashed.id);

  const names = (await domain.listRoster()).map((client) => client.name);
  assert.deepEqual(names, ["Public Player"]);
});

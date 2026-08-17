import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";
import { createDatabase } from "@dtm/database";

import { createCategory } from "./categories";
import { ConflictError, NotFoundError } from "./errors";
import {
  addPlayerVideo,
  createPlayer,
  getPlayer,
  setPlayerVisibility,
  updatePlayer,
} from "./players";

const root = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../../../",
);
process.loadEnvFile(path.join(root, ".env"));

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

function playerInput() {
  return {
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
  };
}

async function completePlayer() {
  const category = await createCategory(db, "Guards");
  return createPlayer(db, {
    ...playerInput(),
    heightCm: 198,
    categoryId: category.id,
    presentationImageUrl: "https://example.com/manu.jpg",
  });
}

test("create Player makes a private Client retrievable by the returned id", async () => {
  const created = await createPlayer(db, playerInput());
  const retrieved = await getPlayer(db, created.id);

  assert.equal(created.name, "Manu Ginobili");
  assert.equal(created.visibility, "private");
  assert.equal(retrieved?.id, created.id);
  assert.equal(retrieved?.name, "Manu Ginobili");
  assert.equal(retrieved?.visibility, "private");
});

test("a Player has at most one Category", async () => {
  const guards = await createCategory(db, "Guards");
  const forwards = await createCategory(db, "Forwards");
  const created = await createPlayer(db, {
    ...playerInput(),
    categoryId: guards.id,
  });

  const updated = await updatePlayer(db, created.id, {
    categoryId: forwards.id,
  });
  const retrieved = await getPlayer(db, created.id);

  assert.equal(updated.categoryId, forwards.id);
  assert.equal(updated.categoryName, "Forwards");
  assert.equal(retrieved?.categoryId, forwards.id);
  assert.equal(retrieved?.categoryName, "Forwards");
});

test("a Player cannot be public unless the profile is complete", async () => {
  const created = await createPlayer(db, playerInput());

  await assert.rejects(
    () => setPlayerVisibility(db, created.id, "public"),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "A Player cannot be public unless the profile is complete.",
  );

  assert.equal((await getPlayer(db, created.id))?.visibility, "private");
});

test("a complete Player can be public", async () => {
  const created = await completePlayer();

  const updated = await setPlayerVisibility(db, created.id, "public");

  assert.equal(updated.visibility, "public");
  assert.equal((await getPlayer(db, created.id))?.visibility, "public");
});

test("a public Player can be made private", async () => {
  const created = await completePlayer();
  await setPlayerVisibility(db, created.id, "public");

  const updated = await setPlayerVisibility(db, created.id, "private");

  assert.equal(updated.visibility, "private");
  assert.equal((await getPlayer(db, created.id))?.visibility, "private");
});

test("editing a public Player refuses an incomplete profile", async () => {
  const created = await completePlayer();
  await setPlayerVisibility(db, created.id, "public");

  await assert.rejects(
    () => updatePlayer(db, created.id, { categoryId: null }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "A Player cannot be public unless the profile is complete.",
  );

  assert.equal((await getPlayer(db, created.id))?.categoryName, "Guards");
});

test("YouTube videos can be stored as URLs", async () => {
  const created = await createPlayer(db, playerInput());
  const youtubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

  await addPlayerVideo(db, created.id, youtubeUrl);
  const retrieved = await getPlayer(db, created.id);

  assert.equal(retrieved?.videos.length, 1);
  assert.equal(retrieved?.videos[0]?.youtubeUrl, youtubeUrl);
});

test("get Player returns null for an id that does not exist", async () => {
  assert.equal(
    await getPlayer(db, "00000000-0000-0000-0000-000000000000"),
    null,
  );
});

test("update Player rejects an id that does not exist", async () => {
  await assert.rejects(
    () =>
      updatePlayer(db, "00000000-0000-0000-0000-000000000000", {
        name: "Manu Ginobili",
      }),
    (error: unknown) =>
      error instanceof NotFoundError && error.message === "Player not found",
  );
});

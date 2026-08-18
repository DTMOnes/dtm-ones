import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";
import { createDatabase } from "@dtm/database";

import { createCategory } from "./categories";
import { ConflictError, NotFoundError } from "./errors";
import {
  addPlayerGalleryImage,
  addPlayerVideo,
  clearPresentationImage,
  commitPresentationImage,
  createPlayer,
  getPlayer,
  removePlayerGalleryImage,
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

function trackingDeleteBlobs() {
  const deleted: string[] = [];
  return {
    deleted,
    deleteBlobs: async (keys: string[]) => {
      deleted.push(...keys);
    },
  };
}

test("commit presentation image stores the URL on the Player", async () => {
  const created = await createPlayer(db, playerInput());
  const blobs = trackingDeleteBlobs();
  const pathname = `players/${created.id}/presentation/manu.jpg`;
  const url = "https://example.com/manu.jpg";

  await commitPresentationImage(
    db,
    created.id,
    { url, pathname },
    blobs.deleteBlobs,
  );
  const retrieved = await getPlayer(db, created.id);

  assert.equal(retrieved?.presentationImageUrl, url);
  assert.deepEqual(blobs.deleted, []);
});

test("commit presentation image for a missing Player deletes the new Blob", async () => {
  const blobs = trackingDeleteBlobs();
  const playerId = "00000000-0000-4000-8000-000000000001";
  const pathname = `players/${playerId}/presentation/manu.jpg`;

  await assert.rejects(
    () =>
      commitPresentationImage(
        db,
        playerId,
        { url: "https://example.com/manu.jpg", pathname },
        blobs.deleteBlobs,
      ),
    (error: unknown) =>
      error instanceof NotFoundError && error.message === "Player not found",
  );

  assert.deepEqual(blobs.deleted, [pathname]);
});

test("commit presentation image rejects a pathname for another Player", async () => {
  const created = await createPlayer(db, playerInput());
  const blobs = trackingDeleteBlobs();
  const pathname =
    "players/00000000-0000-4000-8000-000000000099/presentation/x.jpg";

  await assert.rejects(
    () =>
      commitPresentationImage(
        db,
        created.id,
        { url: "https://example.com/x.jpg", pathname },
        blobs.deleteBlobs,
      ),
    (error: unknown) =>
      error instanceof ConflictError && error.message === "Invalid image path.",
  );

  assert.deepEqual(blobs.deleted, [pathname]);
  assert.equal((await getPlayer(db, created.id))?.presentationImageUrl, null);
});

test("replacing a presentation image deletes the previous Blob", async () => {
  const created = await createPlayer(db, playerInput());
  const blobs = trackingDeleteBlobs();
  const firstPath = `players/${created.id}/presentation/old.jpg`;
  const nextPath = `players/${created.id}/presentation/new.jpg`;

  await commitPresentationImage(
    db,
    created.id,
    { url: "https://example.com/old.jpg", pathname: firstPath },
    blobs.deleteBlobs,
  );
  await commitPresentationImage(
    db,
    created.id,
    { url: "https://example.com/new.jpg", pathname: nextPath },
    blobs.deleteBlobs,
  );

  const retrieved = await getPlayer(db, created.id);
  assert.equal(retrieved?.presentationImageUrl, "https://example.com/new.jpg");
  assert.deepEqual(blobs.deleted, [firstPath]);
});

test("clear presentation image removes it from the Player and deletes the Blob", async () => {
  const created = await createPlayer(db, playerInput());
  const blobs = trackingDeleteBlobs();
  const pathname = `players/${created.id}/presentation/manu.jpg`;

  await commitPresentationImage(
    db,
    created.id,
    { url: "https://example.com/manu.jpg", pathname },
    blobs.deleteBlobs,
  );
  await clearPresentationImage(db, created.id, blobs.deleteBlobs);

  assert.equal((await getPlayer(db, created.id))?.presentationImageUrl, null);
  assert.deepEqual(blobs.deleted, [pathname]);
});

test("a public Player cannot clear the presentation image", async () => {
  const created = await completePlayer();
  await setPlayerVisibility(db, created.id, "public");
  const blobs = trackingDeleteBlobs();

  await assert.rejects(
    () => clearPresentationImage(db, created.id, blobs.deleteBlobs),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "A Player cannot be public unless the profile is complete.",
  );

  assert.equal(
    (await getPlayer(db, created.id))?.presentationImageUrl,
    "https://example.com/manu.jpg",
  );
  assert.deepEqual(blobs.deleted, []);
});

test("gallery images can be added and are retrievable", async () => {
  const created = await createPlayer(db, playerInput());
  const blobs = trackingDeleteBlobs();
  const pathname = `players/${created.id}/gallery/1.jpg`;
  const url = "https://example.com/gallery.jpg";

  await addPlayerGalleryImage(
    db,
    created.id,
    { url, pathname },
    blobs.deleteBlobs,
  );
  const retrieved = await getPlayer(db, created.id);

  assert.equal(retrieved?.gallery.length, 1);
  assert.equal(retrieved?.gallery[0]?.url, url);
  assert.deepEqual(blobs.deleted, []);
});

test("removing a gallery image deletes the Blob", async () => {
  const created = await createPlayer(db, playerInput());
  const blobs = trackingDeleteBlobs();
  const pathname = `players/${created.id}/gallery/1.jpg`;

  const image = await addPlayerGalleryImage(
    db,
    created.id,
    { url: "https://example.com/gallery.jpg", pathname },
    blobs.deleteBlobs,
  );
  await removePlayerGalleryImage(db, created.id, image.id, blobs.deleteBlobs);

  assert.deepEqual((await getPlayer(db, created.id))?.gallery, []);
  assert.deepEqual(blobs.deleted, [pathname]);
});

test("add gallery image for a missing Player deletes the new Blob", async () => {
  const blobs = trackingDeleteBlobs();
  const playerId = "00000000-0000-4000-8000-000000000001";
  const pathname = `players/${playerId}/gallery/1.jpg`;

  await assert.rejects(
    () =>
      addPlayerGalleryImage(
        db,
        playerId,
        { url: "https://example.com/gallery.jpg", pathname },
        blobs.deleteBlobs,
      ),
    (error: unknown) =>
      error instanceof NotFoundError && error.message === "Player not found",
  );

  assert.deepEqual(blobs.deleted, [pathname]);
});

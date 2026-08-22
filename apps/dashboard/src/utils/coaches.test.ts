import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";
import { createDatabase } from "@dtm/database";

import { ConflictError, NotFoundError } from "./errors";
import {
  createCoach,
  getCoach,
  setCoachVisibility,
  updateCoach,
} from "./coaches";
import {
  addPlayerGalleryImage,
  addPlayerVideo,
  clearPresentationImage,
  commitPresentationImage,
  createPlayer,
  getPlayer,
  removePlayerGalleryImage,
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

function coachInput() {
  return {
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
  };
}

function eurobasketLink() {
  return "https://basketball.eurobasket.com/coach/Pat-Riley/1";
}

async function completeCoach() {
  const created = await createCoach(db, {
    ...coachInput(),
    eurobasketLink: eurobasketLink(),
  });
  await commitPresentationImage(
    db,
    created.id,
    {
      url: "https://example.com/pat.jpg",
      pathname: `coaches/${created.id}/presentation/pat.jpg`,
    },
    async () => {},
  );
  await addPlayerGalleryImage(
    db,
    created.id,
    {
      url: "https://example.com/gallery.jpg",
      pathname: `coaches/${created.id}/gallery/1.jpg`,
    },
    async () => {},
  );
  const coach = await getCoach(db, created.id);
  if (!coach) {
    throw new Error("completeCoach could not load coach");
  }
  return coach;
}

test("create Coach makes a private Client retrievable by the returned id", async () => {
  const created = await createCoach(db, coachInput());
  const retrieved = await getCoach(db, created.id);

  assert.equal(created.name, "Pat Riley");
  assert.equal(created.visibility, "private");
  assert.equal(created.eurobasketLink, null);
  assert.equal(retrieved?.id, created.id);
  assert.equal(retrieved?.name, "Pat Riley");
  assert.equal(retrieved?.visibility, "private");
});

test("a Player and a Coach can exist as two Clients", async () => {
  const player = await createPlayer(db, {
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
  });
  const coach = await createCoach(db, coachInput());

  assert.notEqual(player.id, coach.id);
  assert.equal(await getPlayer(db, coach.id), null);
  assert.equal(await getCoach(db, player.id), null);
  assert.equal((await getPlayer(db, player.id))?.name, "Pat Riley");
  assert.equal((await getCoach(db, coach.id))?.name, "Pat Riley");
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

test("commit presentation image stores the URL on the Coach", async () => {
  const created = await createCoach(db, coachInput());
  const blobs = trackingDeleteBlobs();
  const pathname = `coaches/${created.id}/presentation/pat.jpg`;
  const url = "https://example.com/pat.jpg";

  await commitPresentationImage(
    db,
    created.id,
    { url, pathname },
    blobs.deleteBlobs,
  );
  const retrieved = await getCoach(db, created.id);

  assert.equal(retrieved?.presentationImageUrl, url);
  assert.deepEqual(blobs.deleted, []);
});

test("replacing a Coach presentation image deletes the previous Blob", async () => {
  const created = await createCoach(db, coachInput());
  const blobs = trackingDeleteBlobs();
  const firstPath = `coaches/${created.id}/presentation/old.jpg`;
  const nextPath = `coaches/${created.id}/presentation/new.jpg`;

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

  const retrieved = await getCoach(db, created.id);
  assert.equal(retrieved?.presentationImageUrl, "https://example.com/new.jpg");
  assert.deepEqual(blobs.deleted, [firstPath]);
});

test("gallery images can be added and removed on a Coach", async () => {
  const created = await createCoach(db, coachInput());
  const blobs = trackingDeleteBlobs();
  const pathname = `coaches/${created.id}/gallery/1.jpg`;
  const url = "https://example.com/gallery.jpg";

  const image = await addPlayerGalleryImage(
    db,
    created.id,
    { url, pathname },
    blobs.deleteBlobs,
  );
  const afterAdd = await getCoach(db, created.id);

  assert.equal(afterAdd?.gallery.length, 1);
  assert.equal(afterAdd?.gallery[0]?.url, url);
  assert.deepEqual(blobs.deleted, []);

  await removePlayerGalleryImage(db, created.id, image.id, blobs.deleteBlobs);

  assert.deepEqual((await getCoach(db, created.id))?.gallery, []);
  assert.deepEqual(blobs.deleted, [pathname]);
});

test("clear presentation image removes it from the Coach and deletes the Blob", async () => {
  const created = await createCoach(db, coachInput());
  const blobs = trackingDeleteBlobs();
  const pathname = `coaches/${created.id}/presentation/pat.jpg`;

  await commitPresentationImage(
    db,
    created.id,
    { url: "https://example.com/pat.jpg", pathname },
    blobs.deleteBlobs,
  );
  await clearPresentationImage(db, created.id, blobs.deleteBlobs);

  assert.equal((await getCoach(db, created.id))?.presentationImageUrl, null);
  assert.deepEqual(blobs.deleted, [pathname]);
});

test("Player media cannot be stored on a Coach", async () => {
  const coach = await createCoach(db, coachInput());

  await assert.rejects(
    () =>
      addPlayerVideo(
        db,
        coach.id,
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ),
    (error: unknown) =>
      error instanceof NotFoundError && error.message === "Player not found",
  );
});

test("a Coach cannot be public unless the profile is complete", async () => {
  const created = await createCoach(db, coachInput());

  await assert.rejects(
    () => setCoachVisibility(db, created.id, "public"),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "A Coach cannot be public unless the profile is complete.",
  );

  assert.equal((await getCoach(db, created.id))?.visibility, "private");
});

test("a Coach cannot be public without presentation image and gallery", async () => {
  const created = await createCoach(db, {
    ...coachInput(),
    eurobasketLink: eurobasketLink(),
  });

  await assert.rejects(
    () => setCoachVisibility(db, created.id, "public"),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "A Coach cannot be public unless the profile is complete.",
  );

  assert.equal((await getCoach(db, created.id))?.visibility, "private");
});

test("a complete Coach can be public", async () => {
  const created = await completeCoach();

  const updated = await setCoachVisibility(db, created.id, "public");

  assert.equal(updated.visibility, "public");
  assert.equal(updated.eurobasketLink, eurobasketLink());
  assert.equal((await getCoach(db, created.id))?.visibility, "public");
});

test("a public Coach can be made private", async () => {
  const created = await completeCoach();
  await setCoachVisibility(db, created.id, "public");

  const updated = await setCoachVisibility(db, created.id, "private");

  assert.equal(updated.visibility, "private");
  assert.equal((await getCoach(db, created.id))?.visibility, "private");
});

test("editing a public Coach refuses an incomplete profile", async () => {
  const created = await completeCoach();
  await setCoachVisibility(db, created.id, "public");

  await assert.rejects(
    () => updateCoach(db, created.id, { eurobasketLink: null }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "A Coach cannot be public unless the profile is complete.",
  );

  assert.equal((await getCoach(db, created.id))?.eurobasketLink, eurobasketLink());
});

test("a public Coach cannot clear the presentation image", async () => {
  const created = await completeCoach();
  await setCoachVisibility(db, created.id, "public");
  const blobs = trackingDeleteBlobs();

  await assert.rejects(
    () => clearPresentationImage(db, created.id, blobs.deleteBlobs),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "A Coach cannot be public unless the profile is complete.",
  );

  assert.equal(
    (await getCoach(db, created.id))?.presentationImageUrl,
    "https://example.com/pat.jpg",
  );
  assert.deepEqual(blobs.deleted, []);
});

test("a public Coach cannot lose the last gallery image", async () => {
  const created = await completeCoach();
  await setCoachVisibility(db, created.id, "public");
  const blobs = trackingDeleteBlobs();
  const imageId = created.gallery[0]?.id;
  assert.ok(imageId);

  await assert.rejects(
    () => removePlayerGalleryImage(db, created.id, imageId, blobs.deleteBlobs),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "A Coach cannot be public unless the profile is complete.",
  );

  assert.equal((await getCoach(db, created.id))?.gallery.length, 1);
  assert.deepEqual(blobs.deleted, []);
});

test("get Coach returns null for an id that does not exist", async () => {
  assert.equal(
    await getCoach(db, "00000000-0000-0000-0000-000000000000"),
    null,
  );
});

test("update Coach rejects an id that does not exist", async () => {
  await assert.rejects(
    () =>
      updateCoach(db, "00000000-0000-0000-0000-000000000000", {
        name: "Pat Riley",
      }),
    (error: unknown) =>
      error instanceof NotFoundError && error.message === "Coach not found",
  );
});

import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { eq, sql } from "drizzle-orm";
import { createDatabase, listPublicRosterPlayers, schema } from "@dtm/database";

import { createCategory } from "./categories";
import { createCoach, getCoach, setCoachVisibility } from "./coaches";
import { NotFoundError } from "./errors";
import { createPlayer, getPlayer, setPlayerVisibility } from "./players";
import {
  deleteClientFromTrash,
  restoreClient,
  trashClient,
} from "./trash";

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

function coachInput() {
  return {
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
    eurobasketLink: "https://basketball.eurobasket.com/coach/Pat-Riley/1",
  };
}

async function completePublicPlayer() {
  const category = await createCategory(db, "Guards");
  const player = await createPlayer(db, {
    ...playerInput(),
    heightCm: 198,
    categoryId: category.id,
    presentationImageUrl: "https://example.com/manu.jpg",
  });
  return setPlayerVisibility(db, player.id, "public");
}

test("removing a Client to the Trash takes them off the dashboard list", async () => {
  const player = await createPlayer(db, playerInput());
  const coach = await createCoach(db, coachInput());

  await trashClient(db, player.id);
  await trashClient(db, coach.id);

  assert.equal(await getPlayer(db, player.id), null);
  assert.equal(await getCoach(db, coach.id), null);
});

test("restore keeps Visibility; public returns to the Roster", async () => {
  const player = await completePublicPlayer();

  await trashClient(db, player.id);

  assert.equal(await getPlayer(db, player.id), null);
  assert.deepEqual(
    (await listPublicRosterPlayers(db)).map((row) => row.name),
    [],
  );

  await restoreClient(db, player.id);

  assert.equal((await getPlayer(db, player.id))?.visibility, "public");
  assert.deepEqual(
    (await listPublicRosterPlayers(db)).map((row) => row.name),
    ["Manu Ginobili"],
  );
});

test("delete from Trash destroys the Client", async () => {
  const player = await createPlayer(db, playerInput());
  await trashClient(db, player.id);

  await deleteClientFromTrash(db, player.id, async () => {});

  assert.equal(await getPlayer(db, player.id), null);
  await assert.rejects(
    () => restoreClient(db, player.id),
    (error: unknown) =>
      error instanceof NotFoundError && error.message === "Client not found",
  );
});

test("delete from Trash destroys Blob objects when they exist", async () => {
  const player = await createPlayer(db, playerInput());
  await db
    .update(schema.clients)
    .set({ presentationImageKey: "players/manu.jpg" })
    .where(eq(schema.clients.id, player.id));
  await db.insert(schema.playerGalleryImages).values({
    clientId: player.id,
    url: "https://example.com/gallery.jpg",
    storageKey: "players/gallery/1.jpg",
  });
  await trashClient(db, player.id);

  const deleted: string[] = [];
  await deleteClientFromTrash(db, player.id, async (keys) => {
    deleted.push(...keys);
  });

  assert.deepEqual(deleted.sort(), [
    "players/gallery/1.jpg",
    "players/manu.jpg",
  ]);
  assert.equal(await getPlayer(db, player.id), null);
});

test("trashing a Player does not trash a Coach", async () => {
  const player = await createPlayer(db, {
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
  });
  const coach = await createCoach(db, coachInput());

  await trashClient(db, player.id);

  assert.equal(await getPlayer(db, player.id), null);
  assert.equal((await getCoach(db, coach.id))?.name, "Pat Riley");
});

test("a private Client stays private after restore", async () => {
  const coach = await createCoach(db, coachInput());
  await setCoachVisibility(db, coach.id, "public");
  await setCoachVisibility(db, coach.id, "private");

  await trashClient(db, coach.id);
  await restoreClient(db, coach.id);

  assert.equal((await getCoach(db, coach.id))?.visibility, "private");
});

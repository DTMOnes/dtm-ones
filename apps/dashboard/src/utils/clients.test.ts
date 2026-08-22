import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { eq, sql } from "drizzle-orm";
import { createDatabase, schema } from "@dtm/database";

import { createCoach, getCoach } from "./coaches";
import {
  clientDisplayName,
  createClient,
  kindLabel,
  listClients,
} from "./clients";
import { createPlayer, getPlayer, updatePlayer } from "./players";
import { trashClient } from "./trash";

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

test("unset name displays as Untitled Player or Untitled Coach", () => {
  assert.equal(clientDisplayName("player", null), "Untitled Player");
  assert.equal(clientDisplayName("coach", null), "Untitled Coach");
  assert.equal(clientDisplayName("player", "  "), "Untitled Player");
  assert.equal(clientDisplayName("player", "Manu Ginobili"), "Manu Ginobili");
});

test("kindLabel uses the glossary words", () => {
  assert.equal(kindLabel("player"), "Player");
  assert.equal(kindLabel("coach"), "Coach");
});

test("create Client with kind only is private with unset name", async () => {
  const created = await createClient(db, { kind: "player" });

  assert.equal(created.kind, "player");
  assert.equal(created.visibility, "private");
  assert.equal(created.name, null);

  const retrieved = await getPlayer(db, created.id);
  assert.equal(retrieved?.id, created.id);
  assert.equal(retrieved?.visibility, "private");
  assert.equal(retrieved?.name, null);
  assert.equal(retrieved?.nationality, null);
  assert.equal(retrieved?.lastClub, null);
});

test("create Client as Coach is private and is not a Player", async () => {
  const created = await createClient(db, { kind: "coach" });

  assert.equal(created.kind, "coach");
  assert.equal(created.visibility, "private");
  assert.equal(created.name, null);
  assert.equal((await getCoach(db, created.id))?.id, created.id);
  assert.equal(await getPlayer(db, created.id), null);
});

test("kind cannot be changed after create", async () => {
  const created = await createClient(db, { kind: "player" });

  await updatePlayer(db, created.id, { name: "Manu Ginobili" });

  assert.equal((await getPlayer(db, created.id))?.name, "Manu Ginobili");
  assert.equal(await getCoach(db, created.id), null);
});

test("the Clients list is newest first and omits Trash", async () => {
  const older = await createClient(db, { kind: "player" });
  const newer = await createClient(db, { kind: "coach" });
  const trashed = await createClient(db, { kind: "player" });

  await db
    .update(schema.clients)
    .set({ createdAt: new Date("2026-01-01T00:00:00.000Z") })
    .where(eq(schema.clients.id, older.id));
  await db
    .update(schema.clients)
    .set({ createdAt: new Date("2026-01-02T00:00:00.000Z") })
    .where(eq(schema.clients.id, newer.id));
  await db
    .update(schema.clients)
    .set({ createdAt: new Date("2026-01-03T00:00:00.000Z") })
    .where(eq(schema.clients.id, trashed.id));
  await trashClient(db, trashed.id);

  const listed = await listClients(db);

  assert.deepEqual(
    listed.map((client) => client.id),
    [newer.id, older.id],
  );
});

test("Staff can filter the list by Player or Coach", async () => {
  const player = await createClient(db, { kind: "player" });
  const coach = await createClient(db, { kind: "coach" });

  assert.deepEqual(
    (await listClients(db, { kind: "player" })).map((client) => client.id),
    [player.id],
  );
  assert.deepEqual(
    (await listClients(db, { kind: "coach" })).map((client) => client.id),
    [coach.id],
  );
});

test("search by name does not match unset names", async () => {
  const unnamed = await createClient(db, { kind: "player" });
  const named = await createPlayer(db, {
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
  });
  await createCoach(db, {
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
  });

  const listed = await listClients(db, { q: "Manu" });

  assert.deepEqual(
    listed.map((client) => client.id),
    [named.id],
  );
  assert.equal(
    (await listClients(db, { q: "Untitled" })).length,
    0,
  );
  assert.equal(
    listed.some((client) => client.id === unnamed.id),
    false,
  );
});

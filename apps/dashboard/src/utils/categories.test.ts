import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";
import { createDatabase, schema } from "@dtm/database";

import { ConflictError, NotFoundError } from "./errors";
import {
  createCategory,
  deleteCategory,
  getCategory,
  renameCategory,
} from "./categories";

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

test("create Category makes it retrievable by the returned id", async () => {
  const created = await createCategory(db, "Guards");
  const retrieved = await getCategory(db, created.id);

  assert.equal(created.name, "Guards");
  assert.equal(created.slug, "guards");
  assert.equal(retrieved?.id, created.id);
  assert.equal(retrieved?.name, "Guards");
});

test("create Category rejects a name another Category already has", async () => {
  await createCategory(db, "Guards");

  await assert.rejects(
    () => createCategory(db, "guards"),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message === "A Category with this name already exists.",
  );
});

test("rename Category changes the name that get Category returns", async () => {
  const created = await createCategory(db, "Guards");

  const renamed = await renameCategory(db, created.id, "Point Guards");
  const retrieved = await getCategory(db, created.id);

  assert.equal(renamed.name, "Point Guards");
  assert.equal(renamed.slug, "point-guards");
  assert.equal(retrieved?.name, "Point Guards");
});

test("rename Category rejects a name another Category already has", async () => {
  await createCategory(db, "Guards");
  const forwards = await createCategory(db, "Forwards");

  await assert.rejects(
    () => renameCategory(db, forwards.id, "Guards"),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message === "A Category with this name already exists.",
  );
});

test("rename Category rejects an id that does not exist", async () => {
  await assert.rejects(
    () =>
      renameCategory(db, "00000000-0000-0000-0000-000000000000", "Guards"),
    (error: unknown) =>
      error instanceof NotFoundError && error.message === "Category not found",
  );
});

test("delete Category removes one that no Player has", async () => {
  const created = await createCategory(db, "Guards");

  await deleteCategory(db, created.id);

  assert.equal(await getCategory(db, created.id), null);
});

test("delete Category refuses while a Player has it", async () => {
  const created = await createCategory(db, "Guards");
  await db.insert(schema.clients).values({
    kind: "player",
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    visibility: "private",
    heightCm: 198,
    categoryId: created.id,
  });

  await assert.rejects(
    () => deleteCategory(db, created.id),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "You cannot delete a Category while a Player has it.",
  );

  assert.equal((await getCategory(db, created.id))?.name, "Guards");
});

import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";
import { createDatabase, schema } from "@dtm/database";

import { NotFoundError } from "./errors";
import {
  archiveContactRequest,
  deleteContactRequest,
  getContactRequest,
  markContactRequestRead,
  unarchiveContactRequest,
} from "./contact-requests";

const root = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../../../",
);
process.loadEnvFile(path.join(root, ".env"));

const connectionString =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or TEST_DATABASE_URL is required");
}

const db = createDatabase(connectionString);

before(async () => {
  await db.execute(sql`select 1`);
});

beforeEach(async () => {
  await db.execute(sql`truncate table contact_requests restart identity cascade`);
});

async function insertContactRequest(values?: {
  reason?: "seeking_representation" | "looking_for_a_player";
  status?: "new" | "read" | "archived";
  email?: string;
  phone?: string;
  message?: string;
}) {
  const [row] = await db
    .insert(schema.contactRequests)
    .values({
      reason: values?.reason ?? "seeking_representation",
      email: values?.email ?? "alex@example.com",
      phone: values?.phone ?? "+1234567890",
      message: values?.message ?? "I would like representation.",
      status: values?.status ?? "new",
    })
    .returning({ id: schema.contactRequests.id });

  if (!row) {
    throw new Error("insertContactRequest returned no row");
  }

  return row.id;
}

test("get ContactRequest returns seeking representation and looking for a player", async () => {
  const seekingId = await insertContactRequest({
    reason: "seeking_representation",
  });
  const hiringId = await insertContactRequest({
    reason: "looking_for_a_player",
    email: "club@example.com",
    message: "We are looking for a player.",
  });

  const seeking = await getContactRequest(db, seekingId);
  const hiring = await getContactRequest(db, hiringId);

  assert.equal(seeking?.reason, "seeking_representation");
  assert.equal(seeking?.email, "alex@example.com");
  assert.equal(hiring?.reason, "looking_for_a_player");
  assert.equal(hiring?.email, "club@example.com");
});

test("mark ContactRequest read moves a new request to read", async () => {
  const id = await insertContactRequest();

  const updated = await markContactRequestRead(db, id);

  assert.equal(updated.status, "read");
  assert.equal((await getContactRequest(db, id))?.status, "read");
});

test("mark ContactRequest read leaves an archived request archived", async () => {
  const id = await insertContactRequest({ status: "archived" });

  const updated = await markContactRequestRead(db, id);

  assert.equal(updated.status, "archived");
  assert.equal((await getContactRequest(db, id))?.status, "archived");
});

test("mark ContactRequest read rejects an id that does not exist", async () => {
  await assert.rejects(
    () => markContactRequestRead(db, "00000000-0000-0000-0000-000000000000"),
    (error: unknown) =>
      error instanceof NotFoundError &&
      error.message === "ContactRequest not found",
  );
});

test("archive ContactRequest keeps it retrievable as archived", async () => {
  const id = await insertContactRequest();

  const updated = await archiveContactRequest(db, id);

  assert.equal(updated.status, "archived");
  assert.equal((await getContactRequest(db, id))?.status, "archived");
});

test("unarchive ContactRequest moves an archived request to read", async () => {
  const id = await insertContactRequest({ status: "archived" });

  const updated = await unarchiveContactRequest(db, id);

  assert.equal(updated.status, "read");
  assert.equal((await getContactRequest(db, id))?.status, "read");
});

test("delete ContactRequest makes it not retrievable", async () => {
  const id = await insertContactRequest();

  await deleteContactRequest(db, id);

  assert.equal(await getContactRequest(db, id), null);
});

test("archive, unarchive, and delete reject an id that does not exist", async () => {
  const missing = "00000000-0000-0000-0000-000000000000";

  await assert.rejects(
    () => archiveContactRequest(db, missing),
    (error: unknown) =>
      error instanceof NotFoundError &&
      error.message === "ContactRequest not found",
  );
  await assert.rejects(
    () => unarchiveContactRequest(db, missing),
    (error: unknown) =>
      error instanceof NotFoundError &&
      error.message === "ContactRequest not found",
  );
  await assert.rejects(
    () => deleteContactRequest(db, missing),
    (error: unknown) =>
      error instanceof NotFoundError &&
      error.message === "ContactRequest not found",
  );
});

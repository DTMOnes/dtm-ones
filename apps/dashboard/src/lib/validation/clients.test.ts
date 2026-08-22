import assert from "node:assert/strict";
import { test } from "node:test";

import { createClientSchema } from "./clients";

test("create Client accepts Player or Coach kind only", () => {
  assert.equal(createClientSchema.safeParse({ kind: "player" }).success, true);
  assert.equal(createClientSchema.safeParse({ kind: "coach" }).success, true);
});

test("create Client rejects a missing or unknown kind", () => {
  assert.equal(createClientSchema.safeParse({}).success, false);
  assert.equal(createClientSchema.safeParse({ kind: "staff" }).success, false);
});

test("create Client ignores profile fields", () => {
  const parsed = createClientSchema.safeParse({
    kind: "player",
    name: "Manu Ginobili",
    nationality: "Argentina",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.deepEqual(parsed.data, { kind: "player" });
  }
});

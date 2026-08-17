import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createCategorySchema,
  deleteCategorySchema,
  renameCategorySchema,
} from "./categories";

test("create Category accepts a name", () => {
  const parsed = createCategorySchema.safeParse({ name: "Guards" });
  assert.equal(parsed.success, true);
});

test("create Category trims the name", () => {
  const parsed = createCategorySchema.safeParse({ name: "  Guards  " });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.name, "Guards");
  }
});

test("create Category rejects a name that is only spaces", () => {
  const parsed = createCategorySchema.safeParse({ name: "   " });
  assert.equal(parsed.success, false);
});

test("rename Category trims the name and requires an id", () => {
  const parsed = renameCategorySchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    name: "  Guards  ",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.name, "Guards");
  }

  const missing = renameCategorySchema.safeParse({
    id: "not-a-uuid",
    name: "Guards",
  });
  assert.equal(missing.success, false);
});

test("delete Category requires an id", () => {
  const parsed = deleteCategorySchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
  });
  assert.equal(parsed.success, true);

  const missing = deleteCategorySchema.safeParse({ id: "" });
  assert.equal(missing.success, false);
});

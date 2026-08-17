import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createUserSchema,
  deleteUserSchema,
  setUserRoleSchema,
} from "./users";

test("create User accepts name, email, password of at least 8 characters, and Staff", () => {
  const parsed = createUserSchema.safeParse({
    name: "Ana",
    email: "ana@dtm.test",
    password: "password",
    role: "staff",
  });

  assert.equal(parsed.success, true);
});

test("create User accepts Owner", () => {
  const parsed = createUserSchema.safeParse({
    name: "Ana",
    email: "ana@dtm.test",
    password: "password",
    role: "owner",
  });

  assert.equal(parsed.success, true);
});

test("create User rejects a short password", () => {
  const parsed = createUserSchema.safeParse({
    name: "Ana",
    email: "ana@dtm.test",
    password: "short",
    role: "staff",
  });

  assert.equal(parsed.success, false);
});

test("create User rejects a missing at-sign", () => {
  const parsed = createUserSchema.safeParse({
    name: "Ana",
    email: "not-an-email",
    password: "password",
    role: "owner",
  });

  assert.equal(parsed.success, false);
});

test("set role accepts Owner or Staff for another User id", () => {
  const parsed = setUserRoleSchema.safeParse({
    userId: "user-1",
    role: "owner",
  });

  assert.equal(parsed.success, true);
});

test("set role rejects a role that is not Owner or Staff", () => {
  const parsed = setUserRoleSchema.safeParse({
    userId: "user-1",
    role: "admin",
  });

  assert.equal(parsed.success, false);
});

test("delete User requires an id", () => {
  const parsed = deleteUserSchema.safeParse({ id: "user-1" });
  assert.equal(parsed.success, true);

  const missing = deleteUserSchema.safeParse({ id: "" });
  assert.equal(missing.success, false);
});

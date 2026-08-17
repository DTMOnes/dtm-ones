import assert from "node:assert/strict";
import { test } from "node:test";

import { ConflictError } from "../errors";

import {
  assertCanDeleteUser,
  assertCanSetUserRole,
  isLastOwner,
  isOwnUser,
} from "./owner";

test("isOwnUser is true only when the actor is the target", () => {
  assert.equal(isOwnUser("ana", "ana"), true);
  assert.equal(isOwnUser("ana", "ben"), false);
});

test("isLastOwner is true only for an Owner when one Owner remains", () => {
  assert.equal(isLastOwner("owner", 1), true);
  assert.equal(isLastOwner("owner", 2), false);
  assert.equal(isLastOwner("staff", 1), false);
});

test("an Owner cannot set their own role to Staff", () => {
  assert.throws(
    () =>
      assertCanSetUserRole({
        actorId: "ana",
        targetId: "ana",
        targetRole: "owner",
        nextRole: "staff",
        ownerCount: 2,
      }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message ===
        "You cannot change your own role. Another Owner must do it.",
  );
});

test("an Owner cannot set the last Owner to Staff", () => {
  assert.throws(
    () =>
      assertCanSetUserRole({
        actorId: "ana",
        targetId: "ben",
        targetRole: "owner",
        nextRole: "staff",
        ownerCount: 1,
      }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message === "You cannot change the last Owner to Staff.",
  );
});

test("the last Owner cannot set their own role to Staff", () => {
  assert.throws(
    () =>
      assertCanSetUserRole({
        actorId: "ana",
        targetId: "ana",
        targetRole: "owner",
        nextRole: "staff",
        ownerCount: 1,
      }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message === "You cannot change the last Owner to Staff.",
  );
});

test("an Owner can set another Owner to Staff when another Owner remains", () => {
  assert.doesNotThrow(() =>
    assertCanSetUserRole({
      actorId: "ana",
      targetId: "ben",
      targetRole: "owner",
      nextRole: "staff",
      ownerCount: 2,
    }),
  );
});

test("an Owner can promote Staff to Owner", () => {
  assert.doesNotThrow(() =>
    assertCanSetUserRole({
      actorId: "ana",
      targetId: "ben",
      targetRole: "staff",
      nextRole: "owner",
      ownerCount: 1,
    }),
  );
});

test("an Owner cannot delete themselves", () => {
  assert.throws(
    () =>
      assertCanDeleteUser({
        actorId: "ana",
        targetId: "ana",
        targetRole: "owner",
        ownerCount: 2,
      }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message === "You cannot delete yourself. Another Owner must do it.",
  );
});

test("an Owner cannot delete the last Owner", () => {
  assert.throws(
    () =>
      assertCanDeleteUser({
        actorId: "ana",
        targetId: "ben",
        targetRole: "owner",
        ownerCount: 1,
      }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message === "You cannot delete the last Owner.",
  );
});

test("the last Owner cannot delete themselves", () => {
  assert.throws(
    () =>
      assertCanDeleteUser({
        actorId: "ana",
        targetId: "ana",
        targetRole: "owner",
        ownerCount: 1,
      }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message === "You cannot delete the last Owner.",
  );
});

test("an Owner can delete Staff", () => {
  assert.doesNotThrow(() =>
    assertCanDeleteUser({
      actorId: "ana",
      targetId: "ben",
      targetRole: "staff",
      ownerCount: 1,
    }),
  );
});

import assert from "node:assert/strict";
import { test } from "node:test";

import { userFromBetterAuth } from "./user-from-better-auth";

test("an Owner Better Auth user is a User", () => {
  const user = userFromBetterAuth({
    id: "usr_1",
    email: "owner@dtm.test",
    role: "owner",
  });

  assert.deepEqual(user, {
    id: "usr_1",
    email: "owner@dtm.test",
    role: "owner",
  });
});

test("a Staff Better Auth user is a User", () => {
  const user = userFromBetterAuth({
    id: "usr_2",
    email: "staff@dtm.test",
    role: "staff",
  });

  assert.equal(user?.role, "staff");
});

test("any other role is not a User", () => {
  assert.equal(
    userFromBetterAuth({
      id: "usr_3",
      email: "admin@dtm.test",
      role: "admin",
    }),
    null,
  );
});

test("a missing session is not a User", () => {
  assert.equal(userFromBetterAuth(null), null);
  assert.equal(userFromBetterAuth(undefined), null);
});

test("a Better Auth user without email is not a User", () => {
  assert.equal(
    userFromBetterAuth({
      id: "usr_4",
      email: "",
      role: "owner",
    }),
    null,
  );
});

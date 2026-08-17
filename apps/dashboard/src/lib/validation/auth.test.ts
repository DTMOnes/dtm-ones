import assert from "node:assert/strict";
import { test } from "node:test";

import { signInSchema } from "./auth";

test("sign-in accepts an email and a password of at least 8 characters", () => {
  const parsed = signInSchema.safeParse({
    email: "owner@dtm.test",
    password: "password",
  });

  assert.equal(parsed.success, true);
});

test("sign-in rejects a short password", () => {
  const parsed = signInSchema.safeParse({
    email: "owner@dtm.test",
    password: "short",
  });

  assert.equal(parsed.success, false);
});

test("sign-in rejects a missing at-sign", () => {
  const parsed = signInSchema.safeParse({
    email: "not-an-email",
    password: "password",
  });

  assert.equal(parsed.success, false);
});

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./index";

test("UnauthorizedError tells the User to sign in again", () => {
  const error = new UnauthorizedError();
  assert.equal(error.code, "UNAUTHORIZED");
  assert.equal(error.message, "You need to sign in again.");
});

test("ForbiddenError tells the User they cannot do this", () => {
  const error = new ForbiddenError("user-1", "staff");
  assert.equal(error.code, "FORBIDDEN");
  assert.equal(error.message, "You cannot do this.");
  assert.equal(error.userId, "user-1");
  assert.equal(error.role, "staff");
});

test("NotFoundError names the missing record", () => {
  const error = new NotFoundError("Player");
  assert.equal(error.code, "NOT_FOUND");
  assert.equal(error.message, "Player not found");
});

test("ConflictError keeps the message it was given", () => {
  const error = new ConflictError("Email already in use.");
  assert.equal(error.code, "CONFLICT");
  assert.equal(error.message, "Email already in use.");
});

test("AppError is the shared base", () => {
  assert.ok(new UnauthorizedError() instanceof AppError);
  assert.ok(new ForbiddenError() instanceof AppError);
  assert.ok(new NotFoundError("Player") instanceof AppError);
  assert.ok(new ConflictError("taken") instanceof AppError);
});

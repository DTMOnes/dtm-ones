import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AppError,
  ConflictError,
  ForbiddenError,
  InvalidCredentialsError,
  NotFoundError,
  UnauthorizedError,
  interpretActionError,
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

test("InvalidCredentialsError hides whether the email exists", () => {
  const error = new InvalidCredentialsError();
  assert.equal(error.code, "INVALID_CREDENTIALS");
  assert.equal(error.message, "Invalid email or password.");
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

test("interpretActionError sends UnauthorizedError to the unauthorized page", () => {
  const result = interpretActionError(new UnauthorizedError(), {
    actionName: "listContacts",
  });

  assert.equal(result.navigation, "unauthorized");
  assert.deepEqual(result.client, {
    code: "UNAUTHORIZED",
    message: "You need to sign in again.",
  });
  assert.equal(result.log.actionName, "listContacts");
  assert.equal(result.log.code, "UNAUTHORIZED");
  assert.equal(result.log.message, "You need to sign in again.");
  assert.ok(result.log.stack);
});

test("interpretActionError logs User id and role for ForbiddenError", () => {
  const result = interpretActionError(new ForbiddenError("user-9", "staff"), {
    actionName: "createUser",
  });

  assert.equal(result.navigation, "forbidden");
  assert.equal(result.log.userId, "user-9");
  assert.equal(result.log.role, "staff");
  assert.deepEqual(result.client, {
    code: "FORBIDDEN",
    message: "You cannot do this.",
  });
});

test("interpretActionError returns form errors without navigation", () => {
  const result = interpretActionError(new InvalidCredentialsError(), {
    actionName: "signIn",
  });

  assert.equal(result.navigation, null);
  assert.deepEqual(result.client, {
    code: "INVALID_CREDENTIALS",
    message: "Invalid email or password.",
  });
});

test("interpretActionError hides unknown errors as INTERNAL", () => {
  const result = interpretActionError(new Error("relation users does not exist"), {
    actionName: "signIn",
  });

  assert.equal(result.navigation, null);
  assert.equal(result.client.code, "INTERNAL");
  assert.notEqual(result.client.message, "relation users does not exist");
  assert.equal(result.log.code, "INTERNAL");
  assert.match(result.log.message, /relation users does not exist/);
});

test("AppError is the shared base", () => {
  assert.ok(new UnauthorizedError() instanceof AppError);
  assert.ok(new ForbiddenError() instanceof AppError);
  assert.ok(new InvalidCredentialsError() instanceof AppError);
  assert.ok(new NotFoundError("Player") instanceof AppError);
  assert.ok(new ConflictError("taken") instanceof AppError);
});

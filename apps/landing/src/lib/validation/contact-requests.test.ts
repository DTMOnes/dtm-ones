import assert from "node:assert/strict";
import { test } from "node:test";

import { createContactRequestSchema } from "./contact-requests";

const valid = {
  email: "alex@example.com",
  phone: "+1234567890",
  message: "I would like representation.",
};

test("ContactRequest schema accepts seeking representation and looking for a player", () => {
  const seeking = createContactRequestSchema.safeParse({
    ...valid,
    reason: "seeking_representation",
  });
  assert.equal(seeking.success, true);

  const hiring = createContactRequestSchema.safeParse({
    ...valid,
    reason: "looking_for_a_player",
    email: "club@example.com",
    message: "We are looking for a player.",
  });
  assert.equal(hiring.success, true);
});

test("ContactRequest schema rejects a Player-shaped reason", () => {
  const parsed = createContactRequestSchema.safeParse({
    ...valid,
    reason: "player",
  });
  assert.equal(parsed.success, false);
});

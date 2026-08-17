import assert from "node:assert/strict";
import { test } from "node:test";

import { contactRequestIdSchema } from "./contact-requests";

test("ContactRequest id schema requires a uuid", () => {
  const parsed = contactRequestIdSchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
  });
  assert.equal(parsed.success, true);

  const missing = contactRequestIdSchema.safeParse({ id: "" });
  assert.equal(missing.success, false);
});

import assert from "node:assert/strict";
import { test } from "node:test";

import { loadRosterSchema } from "./roster";

test("load Roster schema accepts offset and kind=coach", () => {
  const parsed = loadRosterSchema.safeParse({
    kind: "coach",
    offset: 24,
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.kind, "coach");
    assert.equal(parsed.data.offset, 24);
  }
});

test("load Roster schema rejects a negative offset", () => {
  const parsed = loadRosterSchema.safeParse({ offset: -1 });
  assert.equal(parsed.success, false);
});

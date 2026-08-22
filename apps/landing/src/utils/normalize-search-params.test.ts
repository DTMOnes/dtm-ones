import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeSearchParams } from "./normalize-search-params";

test("kind=coach is a Roster filter and clears Category ids", () => {
  const parsed = normalizeSearchParams({
    q: "Riley",
    c: "11111111-1111-1111-1111-111111111111",
    kind: "coach",
  });

  assert.deepEqual(parsed, {
    q: "Riley",
    c: [],
    kind: "coach",
  });
});

test("kind other than coach is ignored", () => {
  const parsed = normalizeSearchParams({
    c: "11111111-1111-1111-1111-111111111111",
    kind: "player",
  });

  assert.deepEqual(parsed, {
    q: undefined,
    c: ["11111111-1111-1111-1111-111111111111"],
    kind: undefined,
  });
});

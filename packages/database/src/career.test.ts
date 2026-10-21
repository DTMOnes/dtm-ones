import assert from "node:assert/strict";
import { test } from "node:test";

import { latestSeasonTies } from "./career";

test("latestSeasonTies only flags clubs sharing the latest season", () => {
  const entry = (id: string, season: string) => ({ id, season });

  assert.deepEqual(
    [...latestSeasonTies([entry("a", "2026"), entry("b", "2025-26"), entry("c", "2024")])],
    ["a", "b"],
  );
  assert.deepEqual(
    [...latestSeasonTies([entry("a", "2026"), entry("b", "2024"), entry("c", "2024")])],
    [],
  );
  assert.deepEqual([...latestSeasonTies([])], []);
});

import assert from "node:assert/strict";
import { test } from "node:test";

import { latestSeasonTies, sortAwardsByYear } from "./career";

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

test("sortAwardsByYear puts the newest year first and undated titles last", () => {
  const award = (title: string, year: string | null) => ({ title, year });
  assert.deepEqual(
    sortAwardsByYear([
      award("A", "2023"),
      award("No year", null),
      award("B", "2025-26"),
      award("C", "2026"),
      award("D", "2023"),
    ]).map((a) => a.title),
    ["B", "C", "A", "D", "No year"],
  );
});

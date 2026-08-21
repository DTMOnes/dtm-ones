import assert from "node:assert/strict";
import { test } from "node:test";

import {
  playerCompletenessChecks,
  playerCompletenessGaps,
} from "./players";

const complete = {
  name: "Manu Ginobili",
  nationality: "Argentina",
  lastClub: "San Antonio Spurs",
  heightCm: 198,
  categoryId: "guards",
  presentationImageUrl: "https://example.com/manu.jpg",
};

test("playerCompletenessChecks marks missing fields as unmet", () => {
  const unmet = playerCompletenessChecks({
    ...complete,
    lastClub: "  ",
    heightCm: null,
    presentationImageUrl: null,
  })
    .filter((check) => !check.met)
    .map((check) => check.label);

  assert.deepEqual(unmet, ["Last club", "Height", "Presentation image"]);
});

test("playerCompletenessGaps is the unmet labels", () => {
  assert.deepEqual(playerCompletenessGaps(complete), []);
  assert.deepEqual(
    playerCompletenessGaps({ ...complete, categoryId: null }),
    ["Category"],
  );
});

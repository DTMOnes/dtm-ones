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
  eurobasketLink: "https://basketball.eurobasket.com/player/Manu-Ginobili/1",
  gallery: [{ id: "g1" }],
  videos: [{ id: "v1" }],
};

test("playerCompletenessChecks marks missing fields as unmet", () => {
  const unmet = playerCompletenessChecks({
    ...complete,
    lastClub: "  ",
    heightCm: null,
    presentationImageUrl: null,
    eurobasketLink: null,
    gallery: [],
    videos: [],
  })
    .filter((check) => !check.met)
    .map((check) => check.label);

  assert.deepEqual(unmet, [
    "Last club",
    "Height",
    "Presentation image",
    "Eurobasket link",
    "Gallery image",
    "Video",
  ]);
});

test("playerCompletenessGaps is the unmet labels", () => {
  assert.deepEqual(playerCompletenessGaps(complete), []);
  assert.deepEqual(
    playerCompletenessGaps({ ...complete, categoryId: null }),
    ["Category"],
  );
});

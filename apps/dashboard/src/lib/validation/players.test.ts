import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addPlayerVideoSchema,
  setPlayerVisibilitySchema,
  updatePlayerSchema,
  youtubeUrlSchema,
} from "./players";

test("update Player treats empty Eurobasket URL as absent", () => {
  const parsed = updatePlayerSchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    heightCm: "198",
    categoryId: "00000000-0000-4000-8000-000000000002",
    eurobasketLink: "",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.eurobasketLink, null);
    assert.equal("presentationImageUrl" in parsed.data, false);
  }
});

test("Visibility is public or private", () => {
  const parsed = setPlayerVisibilitySchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    visibility: "public",
  });
  assert.equal(parsed.success, true);

  const draft = setPlayerVisibilitySchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    visibility: "draft",
  });
  assert.equal(draft.success, false);
});

test("YouTube URL accepts youtube.com and youtu.be", () => {
  assert.equal(
    youtubeUrlSchema.safeParse("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      .success,
    true,
  );
  assert.equal(
    youtubeUrlSchema.safeParse("https://youtu.be/dQw4w9WgXcQ").success,
    true,
  );
});

test("YouTube URL rejects a non-YouTube URL", () => {
  assert.equal(
    youtubeUrlSchema.safeParse("https://vimeo.com/123").success,
    false,
  );
});

test("add Player video requires a Player id and a YouTube URL", () => {
  const parsed = addPlayerVideoSchema.safeParse({
    playerId: "00000000-0000-4000-8000-000000000001",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  });
  assert.equal(parsed.success, true);
});

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addPlayerVideoSchema,
  createPlayerSchema,
  setPlayerVisibilitySchema,
  updatePlayerSchema,
  youtubeUrlSchema,
} from "./players";

test("create Player accepts name, nationality, and last club", () => {
  const parsed = createPlayerSchema.safeParse({
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    heightCm: "",
    categoryId: "",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.heightCm, null);
    assert.equal(parsed.data.categoryId, null);
  }
});

test("create Player trims text and parses height", () => {
  const parsed = createPlayerSchema.safeParse({
    name: "  Manu Ginobili  ",
    nationality: "  Argentina  ",
    lastClub: "  San Antonio Spurs  ",
    heightCm: "198",
    categoryId: "00000000-0000-4000-8000-000000000001",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.name, "Manu Ginobili");
    assert.equal(parsed.data.heightCm, 198);
    assert.equal(
      parsed.data.categoryId,
      "00000000-0000-4000-8000-000000000001",
    );
  }
});

test("create Player rejects a name that is only spaces", () => {
  const parsed = createPlayerSchema.safeParse({
    name: "   ",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    heightCm: "",
    categoryId: "",
  });

  assert.equal(parsed.success, false);
});

test("create Player rejects a fractional height", () => {
  const parsed = createPlayerSchema.safeParse({
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    heightCm: "198.5",
    categoryId: "",
  });

  assert.equal(parsed.success, false);
});

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

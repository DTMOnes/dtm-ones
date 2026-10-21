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

test("update Player reads strengths per line and drops empty season stats", () => {
  const parsed = updatePlayerSchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    heightCm: "198",
    categoryId: "",
    eurobasketLink: "",
    birthDate: "",
    league: " ",
    bio: "",
    strengths: "Scorer\n\n Playmaker ",
    seasonStats: { season: "", ppg: "", rpg: "" },
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.deepEqual(parsed.data.strengths, ["Scorer", "Playmaker"]);
    assert.equal(parsed.data.seasonStats, null);
    assert.equal(parsed.data.league, null);
    assert.equal(parsed.data.birthDate, null);
  }
});

test("update Player season stats need a season", () => {
  const base = {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Manu Ginobili",
    nationality: "Argentina",
    lastClub: "San Antonio Spurs",
    strengths: "",
  };

  assert.equal(
    updatePlayerSchema.safeParse({ ...base, seasonStats: { ppg: "12.5" } })
      .success,
    false,
  );

  const parsed = updatePlayerSchema.safeParse({
    ...base,
    seasonStats: { season: "2025-26", ppg: "12.5", fgPct: "48.2" },
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.seasonStats?.season, "2025-26");
    assert.equal(parsed.data.seasonStats?.ppg, 12.5);
    assert.equal(parsed.data.seasonStats?.rpg, null);
  }
});

test("Instagram hashtag drops the # and rejects spaces", () => {
  const base = {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Romeao Ferguson",
    nationality: "USA",
    lastClub: "Mineros",
  };

  const parsed = updatePlayerSchema.safeParse({ ...base, instagramHashtag: " #RomeaoFerguson " });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.instagramHashtag, "RomeaoFerguson");

  const empty = updatePlayerSchema.safeParse({ ...base, instagramHashtag: "" });
  assert.equal(empty.success && empty.data.instagramHashtag, null);

  assert.equal(
    updatePlayerSchema.safeParse({ ...base, instagramHashtag: "Romeao Ferguson" }).success,
    false,
  );
});

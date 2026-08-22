import assert from "node:assert/strict";
import { test } from "node:test";

import { isAllowedPlayerImage, isClientBlobPathname, isPlayerBlobPathname, playerBlobPathname, clientBlobPathname } from "./player-blob-path";

const playerId = "00000000-0000-4000-8000-000000000001";
const otherId = "00000000-0000-4000-8000-000000000002";

test("a presentation pathname is bound to that Player", () => {
  assert.equal(
    isPlayerBlobPathname(
      playerId,
      "presentation",
      `players/${playerId}/presentation/manu.jpg`,
    ),
    true,
  );
  assert.equal(
    isPlayerBlobPathname(
      playerId,
      "presentation",
      `players/${playerId}/presentation/manu-abc123.jpg`,
    ),
    true,
  );
});

test("a gallery pathname is bound to that Player", () => {
  assert.equal(
    isPlayerBlobPathname(
      playerId,
      "gallery",
      `players/${playerId}/gallery/1.webp`,
    ),
    true,
  );
});

test("a pathname for another Player is rejected", () => {
  assert.equal(
    isPlayerBlobPathname(
      playerId,
      "presentation",
      `players/${otherId}/presentation/manu.jpg`,
    ),
    false,
  );
});

test("a presentation pathname is not valid as gallery", () => {
  assert.equal(
    isPlayerBlobPathname(
      playerId,
      "gallery",
      `players/${playerId}/presentation/manu.jpg`,
    ),
    false,
  );
});

test("a pathname without a file is rejected", () => {
  assert.equal(
    isPlayerBlobPathname(
      playerId,
      "presentation",
      `players/${playerId}/presentation/`,
    ),
    false,
  );
});

test("a Player image file must be JPEG, PNG, or WebP of 5 MB or less", () => {
  assert.equal(
    isAllowedPlayerImage({ size: 1024, type: "image/jpeg" }),
    true,
  );
  assert.equal(
    isAllowedPlayerImage({ size: 1024, type: "image/png" }),
    true,
  );
  assert.equal(
    isAllowedPlayerImage({ size: 1024, type: "image/webp" }),
    true,
  );
  assert.equal(
    isAllowedPlayerImage({ size: 1024, type: "image/gif" }),
    false,
  );
  assert.equal(
    isAllowedPlayerImage({ size: 5 * 1024 * 1024 + 1, type: "image/jpeg" }),
    false,
  );
});

test("a Blob pathname uses the Player id, slot, and file name", () => {
  assert.equal(
    playerBlobPathname(playerId, "presentation", "manu.jpg"),
    `players/${playerId}/presentation/manu.jpg`,
  );
  assert.equal(
    playerBlobPathname(playerId, "gallery", "C:\\photos\\shot 1.png"),
    `players/${playerId}/gallery/shot-1.png`,
  );
});

test("a presentation pathname is bound to that Coach", () => {
  assert.equal(
    isClientBlobPathname(
      "coach",
      otherId,
      "presentation",
      `coaches/${otherId}/presentation/pat.jpg`,
    ),
    true,
  );
  assert.equal(
    isClientBlobPathname(
      "coach",
      otherId,
      "presentation",
      `players/${otherId}/presentation/pat.jpg`,
    ),
    false,
  );
});

test("a Blob pathname uses the Coach id, slot, and file name", () => {
  assert.equal(
    clientBlobPathname("coach", otherId, "gallery", "shot 1.png"),
    `coaches/${otherId}/gallery/shot-1.png`,
  );
});

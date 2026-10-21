import assert from "node:assert/strict";
import { test } from "node:test";

import type { PublicRosterPlayer } from "@/types/roster";

import {
  ageFrom,
  formatHeight,
  formatStat,
  pickFeatured,
  previousCountries,
  seasonEndYear,
  sortCareer,
  splitName,
} from "./player-display";

test("splitName keeps the surname apart from the first names", () => {
  assert.deepEqual(splitName("Cli'Ron Hornbeak"), { first: "Cli'Ron", last: "Hornbeak" });
  assert.deepEqual(splitName("Joaquin Gomez Del Conte"), {
    first: "Joaquin Gomez Del",
    last: "Conte",
  });
  assert.deepEqual(splitName("Manu"), { first: "", last: "Manu" });
});

test("formatHeight shows feet and centimetres", () => {
  assert.equal(formatHeight(195), `6'5" (195 cm)`);
  assert.equal(formatHeight(null), null);
});

test("ageFrom counts the birthday only once it has passed", () => {
  const now = new Date(2026, 9, 18);
  assert.equal(ageFrom("2000-10-18", now), 26);
  assert.equal(ageFrom("2000-10-19", now), 25);
  assert.equal(ageFrom(null, now), null);
});

test("formatStat rounds to one decimal and marks missing values", () => {
  assert.equal(formatStat(12.345), "12.3");
  assert.equal(formatStat(48, true), "48%");
  assert.equal(formatStat(null), "—");
});

test("previousCountries skips the current club and repeats", () => {
  const client = {
    career: [
      { id: "1", season: "2026", club: "Mineros", league: "LNBP", country: "Mexico" },
      { id: "2", season: "2025", club: "A", league: null, country: "Spain" },
      { id: "3", season: "2024", club: "B", league: null, country: "spain" },
      { id: "4", season: "2023", club: "C", league: null, country: null },
    ],
  } as PublicRosterPlayer;

  assert.deepEqual(previousCountries(client), ["Spain"]);
});

test("sortCareer puts the newest season first, whatever the entry order", () => {
  const entries = [
    { season: "2021-2024", club: "Olimpico" },
    { season: "2024-2026", club: "Independiente" },
    { season: "2026", club: "El Ceibo" },
    { season: "2019-20", club: "Earlier" },
  ];
  assert.deepEqual(
    sortCareer(entries).map((entry) => entry.club),
    ["El Ceibo", "Independiente", "Olimpico", "Earlier"],
  );
  assert.equal(seasonEndYear("2025-26"), 2026);
  assert.equal(seasonEndYear("2021-2024"), 2024);
});

test("sortCareer puts the club marked current first among the latest season", () => {
  const entries = [
    { season: "2025", club: "Older", isCurrent: true },
    { season: "2026", club: "Team A", isCurrent: false },
    { season: "2026", club: "Team B", isCurrent: true },
  ];
  assert.deepEqual(
    sortCareer(entries).map((entry) => entry.club),
    ["Team B", "Team A", "Older"],
  );
});

test("previousCountries leaves out the current club's country", () => {
  const client = {
    career: [
      { id: "1", season: "2026", club: "El Ceibo", league: null, country: "Argentina" },
      { id: "2", season: "2024", club: "Independiente", league: null, country: "argentina" },
      { id: "3", season: "2021", club: "Olimpico", league: null, country: "Argentina" },
    ],
  } as PublicRosterPlayer;

  assert.deepEqual(previousCountries(client), []);
});

test("pickFeatured keeps the fixed order and fills a gap when one is hidden", () => {
  const p = (id: string) => ({ id });
  const list = ["a", "b", "c", "d", "e", "f", "g"].map(p);

  assert.deepEqual(
    pickFeatured(list, ["e", "a", "g"], 5).map((x) => x.id),
    ["e", "a", "g", "b", "c"],
  );
  // "g" is no longer public: the next public player takes the fifth slot.
  assert.deepEqual(
    pickFeatured(list.filter((x) => x.id !== "g"), ["e", "a", "g"], 5).map((x) => x.id),
    ["e", "a", "b", "c", "d"],
  );
});

import assert from "node:assert/strict";
import { test } from "node:test";

import type { PublicRosterPlayer } from "@/types/roster";

import {
  ageFrom,
  formatHeight,
  formatLeague,
  formatStat,
  pickFeatured,
  previousLeagues,
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

test("previousLeagues lists earlier leagues once, without the current one", () => {
  const client = {
    league: "LNBP - Mexico",
    career: [
      { id: "1", season: "2026/2027", club: "Soles", league: "LNBP", country: "Mexico" },
      { id: "2", season: "2025/2026", club: "Quimsa", league: "La Liga", country: "Argentina" },
      { id: "3", season: "2024/2025", club: "Ironi", league: "Winner League", country: "Israel" },
      { id: "4", season: "2023/2024", club: "Mets", league: "BSN", country: "Puerto Rico" },
      { id: "5", season: "2022/2023", club: "Ironi", league: "Winner League", country: "Israel" },
      { id: "6", season: "2020/2021", club: "Aguacateros", league: "LNBP", country: "Mexico" },
      { id: "7", season: "2019", club: "No data", league: null, country: null },
      { id: "8", season: "2018", club: "Flamengo", league: null, country: "Brazil" },
    ],
  } as PublicRosterPlayer;

  assert.deepEqual(previousLeagues(client), [
    "La Liga · Argentina",
    "Winner League · Israel",
    "BSN · Puerto Rico",
    "Brazil",
  ]);
});

test("formatLeague shows a spaced dash or bar as the dot", () => {
  assert.equal(formatLeague("LNBP - Mexico"), "LNBP · Mexico");
  assert.equal(formatLeague("La Liga – Argentina"), "La Liga · Argentina");
  assert.equal(formatLeague("BSN | Puerto Rico"), "BSN · Puerto Rico");
  assert.equal(formatLeague("LNBP · Mexico"), "LNBP · Mexico");
  assert.equal(formatLeague("Hai-Motors League"), "Hai-Motors League");
});

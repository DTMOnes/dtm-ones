import assert from "node:assert/strict";
import { test } from "node:test";

import { listFacts, personInitials, visibilityLabel } from "./list-row";

test("personInitials uses first and last words", () => {
  assert.equal(personInitials("Facundo Campazzo"), "FC");
  assert.equal(personInitials("Manu"), "MA");
  assert.equal(personInitials("  "), "?");
  assert.equal(personInitials("Ana María Pérez"), "AP");
});

test("listFacts drops empty parts and joins with one separator", () => {
  assert.equal(listFacts("198 cm", "Argentina", "Public"), "198 cm · Argentina · Public");
  assert.equal(listFacts("198 cm", null, undefined, ""), "198 cm");
  assert.equal(listFacts(null, undefined), "");
});

test("visibilityLabel maps the glossary words", () => {
  assert.equal(visibilityLabel("public"), "Public");
  assert.equal(visibilityLabel("private"), "Private");
});

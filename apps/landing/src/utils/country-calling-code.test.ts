import assert from "node:assert/strict";
import { test } from "node:test";

import { callingCountry, countryFromLocale, fullPhone } from "./country-calling-code";

test("fullPhone puts the country calling code before the number", () => {
  assert.equal(fullPhone("AR", " 11 5555 0000 "), "+54 11 5555 0000");
  assert.equal(fullPhone("US", "201 555 0123"), "+1 201 555 0123");
  assert.equal(callingCountry("ZZ").code, "US");
});

test("countryFromLocale reads the browser language region", () => {
  assert.equal(countryFromLocale("es-AR"), "AR");
  assert.equal(countryFromLocale("pt-BR"), "BR");
  assert.equal(countryFromLocale("en"), "US");
  assert.equal(countryFromLocale("not a locale!"), "US");
});

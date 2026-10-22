import assert from "node:assert/strict";
import { test } from "node:test";

import { hashRosterPassword, rosterAccessToken, verifyRosterPassword } from "./roster-access";

test("roster password: stored as a salted hash and checked against it", () => {
  const stored = hashRosterPassword("Nueva-Clave");

  assert.ok(stored.startsWith("scrypt$"));
  assert.ok(!stored.includes("Nueva-Clave"));
  assert.notEqual(stored, hashRosterPassword("Nueva-Clave")); // new salt each time
  assert.equal(verifyRosterPassword("Nueva-Clave", stored), true);
  assert.equal(verifyRosterPassword(" Nueva-Clave ", stored), true);
  assert.equal(verifyRosterPassword("nueva-clave", stored), false);
  assert.equal(verifyRosterPassword("Nueva-Clave", "garbage"), false);
});

test("roster access token changes with the password", () => {
  const a = hashRosterPassword("one");
  const b = hashRosterPassword("two");
  assert.notEqual(rosterAccessToken(a), rosterAccessToken(b));
  assert.equal(rosterAccessToken(a), rosterAccessToken(a));
  assert.equal(rosterAccessToken(null).length, 32);
});

import assert from "node:assert/strict";
import { test } from "node:test";

import { testDatabaseUrl } from "./testing";

test("testDatabaseUrl never falls back to the production DATABASE_URL", () => {
  const prod = "postgresql://u:p@ep-prod.neon.tech/db";
  const branch = "postgresql://u:p@ep-branch.neon.tech/db";

  assert.throws(() => testDatabaseUrl({ DATABASE_URL: prod }), /TEST_DATABASE_URL is required/);
  assert.throws(() => testDatabaseUrl({ DATABASE_URL: prod, TEST_DATABASE_URL: prod }), /must not point/);
  assert.equal(testDatabaseUrl({ DATABASE_URL: prod, TEST_DATABASE_URL: branch }), branch);
});

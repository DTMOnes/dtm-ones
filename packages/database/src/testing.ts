// Integration tests TRUNCATE tables, so they only run against an explicit test database.
// There is no fallback to DATABASE_URL: that is production in the root .env.

/** TEST_DATABASE_URL, or throws when it is missing or points at the DATABASE_URL host. */
export function testDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const url = env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TEST_DATABASE_URL is required: point it at a Neon test branch. Tests wipe tables.",
    );
  }
  if (env.DATABASE_URL && new URL(url).hostname === new URL(env.DATABASE_URL).hostname) {
    throw new Error("TEST_DATABASE_URL must not point at the DATABASE_URL host (production).");
  }
  return url;
}

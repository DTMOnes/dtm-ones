import { sql } from "drizzle-orm";

import type { Database } from "./client";

/** Production Neon role for the landing app. Create it in Neon; tests use a separate role. */
export const LANDING_ROLE_NAME = "dtm_landing";

const TEST_LANDING_ROLE_NAME = "dtm_landing_test";
/** Neon requires ~60-bit password entropy. */
const TEST_LANDING_ROLE_PASSWORD = "dtm-landing-test-Pw9kQ2mX7nL4vR8w";

function quoteIdent(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function databaseName(connectionString: string): string {
  const { pathname } = new URL(connectionString);
  const name = decodeURIComponent(pathname.replace(/^\//, "").split("/")[0] ?? "");
  return name.length > 0 ? name : "neondb";
}

export function landingConnectionString(
  ownerConnectionString: string,
  user: string,
  password: string,
): string {
  const url = new URL(ownerConnectionString);
  url.username = user;
  url.password = password;
  return url.toString();
}

export async function grantLandingPrivileges(
  ownerDb: Database,
  roleName: string,
  ownerConnectionString: string,
): Promise<void> {
  const role = quoteIdent(roleName);
  const dbName = quoteIdent(databaseName(ownerConnectionString));

  try {
    await ownerDb.execute(sql.raw(`GRANT CONNECT ON DATABASE ${dbName} TO ${role}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/permission denied|must be owner|cannot grant/i.test(message)) {
      throw error;
    }
  }

  await ownerDb.execute(sql.raw(`GRANT USAGE ON SCHEMA public TO ${role}`));
  await ownerDb.execute(
    sql.raw(`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM ${role}`),
  );
  await ownerDb.execute(sql.raw(`REVOKE ALL ON SCHEMA better_auth FROM ${role}`));
  await ownerDb.execute(
    sql.raw(`REVOKE ALL ON ALL TABLES IN SCHEMA better_auth FROM ${role}`),
  );
  await ownerDb.execute(
    sql.raw(
      `GRANT SELECT ON roster, roster_gallery_images, roster_videos TO ${role}`,
    ),
  );
  await ownerDb.execute(sql.raw(`GRANT INSERT ON contact_requests TO ${role}`));
}

export async function ensureTestLandingRole(
  ownerDb: Database,
  ownerConnectionString: string,
): Promise<string> {
  const role = quoteIdent(TEST_LANDING_ROLE_NAME);
  const password = quoteLiteral(TEST_LANDING_ROLE_PASSWORD);

  await ownerDb.execute(
    sql.raw(`
      DO $do$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM pg_roles WHERE rolname = ${quoteLiteral(TEST_LANDING_ROLE_NAME)}
        ) THEN
          CREATE ROLE ${role} WITH LOGIN PASSWORD ${password};
        ELSE
          ALTER ROLE ${role} WITH LOGIN PASSWORD ${password};
        END IF;
      END
      $do$;
    `),
  );

  await grantLandingPrivileges(
    ownerDb,
    TEST_LANDING_ROLE_NAME,
    ownerConnectionString,
  );

  return landingConnectionString(
    ownerConnectionString,
    TEST_LANDING_ROLE_NAME,
    TEST_LANDING_ROLE_PASSWORD,
  );
}

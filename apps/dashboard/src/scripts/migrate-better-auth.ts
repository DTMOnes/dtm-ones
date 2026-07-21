import { loadEnvConfig } from "@next/env";
import path from "node:path";

loadEnvConfig(path.resolve(__dirname, "../../../.."), undefined, undefined, true);

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is missing");
  }
  if (!process.env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL is missing");
  }

  const { getMigrations } = await import("better-auth/db");
  const { auth } = await import("../lib/auth");

  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(
    auth.options,
  );

  console.log(
    "MIGRATE_PLAN",
    JSON.stringify({
      toBeCreated: toBeCreated.map((table) => table.table),
      toBeAdded: toBeAdded.map((table) => table.table),
    }),
  );

  await runMigrations();
  console.log("MIGRATE_OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

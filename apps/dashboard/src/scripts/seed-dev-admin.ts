import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  throw new Error(
    "Seed script deprecated: dashboard no longer manages auth/database directly. Create admin users from apps/api.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

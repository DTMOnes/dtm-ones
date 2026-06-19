import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import path from "node:path";

loadEnvConfig(path.resolve(process.cwd(), "../.."), undefined, undefined, true);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run Drizzle Kit.");
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});

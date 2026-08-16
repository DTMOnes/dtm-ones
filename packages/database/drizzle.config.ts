import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { fileURLToPath } from "node:url";

config({
  path: path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../.env"),
});

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  schemaFilter: ["public", "better_auth"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

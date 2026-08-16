import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(configDir, "../..");
const repoRoot = path.resolve(packageRoot, "../..");

config({
  path: path.join(repoRoot, ".env"),
});

export default defineConfig({
  out: path.join(packageRoot, "drizzle"),
  schema: path.join(configDir, "../db/schema/index.ts"),
  dialect: "postgresql",
  schemaFilter: ["public", "better_auth"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

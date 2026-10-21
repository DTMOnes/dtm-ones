import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");
config({ path: path.join(root, ".env") });

const file = process.argv[2];
const connectionString = process.env.DATABASE_URL;

if (!file || !connectionString) {
  throw new Error("Usage: DATABASE_URL=... pnpm db:migrate <file.sql>");
}

// The file holds its own BEGIN/COMMIT; a pool connection runs it as one script.
const pool = new Pool({ connectionString });
try {
  await pool.query(await readFile(path.resolve(file), "utf8"));
  console.log(`Applied ${file} to ${new URL(connectionString).hostname}`);
} finally {
  await pool.end();
}

import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { createDatabase } from "../db/client";
import {
  grantLandingPrivileges,
  LANDING_ROLE_NAME,
} from "../db/landing-role";

const root = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../../..",
);
config({ path: path.join(root, ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const db = createDatabase(connectionString);
await grantLandingPrivileges(db, LANDING_ROLE_NAME, connectionString);
console.log(`Granted landing privileges to ${LANDING_ROLE_NAME}`);

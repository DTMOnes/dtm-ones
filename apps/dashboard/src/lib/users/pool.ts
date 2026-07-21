import { Pool } from "pg";

import { env } from "@/config/env";

let pool: Pool | null = null;

export function getUsersDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }

  return pool;
}

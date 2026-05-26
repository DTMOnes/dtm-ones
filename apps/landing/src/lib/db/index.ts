import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";

// Schema
import * as schema from "@/lib/db/schema";

// Env
import { env } from "@/config/env";

const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle({ client, schema });

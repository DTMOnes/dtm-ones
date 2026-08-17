import { createDatabase } from "@dtm/database";

import { env } from "@/config/env";

export const db = createDatabase(env.DATABASE_URL);

import { env as databaseEnv } from "@dtm/database/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [databaseEnv],
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
  },

  /**
   * Next.js statically analyzes only `NEXT_PUBLIC_*` references; list them here.
   * Server variables are read from `process.env` at runtime (see env-nextjs).
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },

  emptyStringAsUndefined: true,

  /** Set `SKIP_ENV_VALIDATION=true` only when required (e.g. incomplete CI env). */
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

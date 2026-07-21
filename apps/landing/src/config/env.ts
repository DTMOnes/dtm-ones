import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
  },

  client: {
    NEXT_PUBLIC_INSFORGE_URL: z.url(),
    NEXT_PUBLIC_INSFORGE_ANON_KEY: z.string().min(1),
  },

  /**
   * Next.js statically analyzes only `NEXT_PUBLIC_*` references; list them here.
   * Server variables are read from `process.env` at runtime (see env-nextjs).
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_INSFORGE_URL: process.env.NEXT_PUBLIC_INSFORGE_URL,
    NEXT_PUBLIC_INSFORGE_ANON_KEY: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  },
  emptyStringAsUndefined: true,

  /** Set `SKIP_ENV_VALIDATION=true` only when required (e.g. incomplete CI env). */
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

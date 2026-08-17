import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Database package preset. Apps that need a connection `extends` this.
 * See `.cursor/rules/env-variables.mdc`.
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

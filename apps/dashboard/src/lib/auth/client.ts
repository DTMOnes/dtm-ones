// Better Auth
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Env
import { env } from "@/config/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [adminClient()],
});

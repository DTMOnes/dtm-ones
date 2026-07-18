import { createRefreshAuthRouter } from "@insforge/sdk/ssr";

import { env } from "@/config/env";

export const { POST } = createRefreshAuthRouter({
  baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

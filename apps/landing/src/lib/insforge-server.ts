import { createClient, type InsForgeClient } from "@insforge/sdk";

import { env } from "@/config/env";

/** Anonymous InsForge client for public landing reads (no session JWT). */
export function createInsforgeServer(): InsForgeClient {
  return createClient({
    baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  });
}

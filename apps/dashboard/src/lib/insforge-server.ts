import { cookies } from "next/headers";
import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";

import { env } from "@/config/env";

function insforgeConfig() {
  return {
    baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  };
}

export async function createInsforgeServer() {
  const cookieStore = await cookies();
  return createServerClient({
    ...insforgeConfig(),
    cookies: cookieStore,
  });
}

export async function createInsforgeAuthActions() {
  const cookieStore = await cookies();
  return createAuthActions({
    ...insforgeConfig(),
    cookies: cookieStore,
  });
}

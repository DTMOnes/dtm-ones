import { createClient, type InsForgeClient } from "@insforge/sdk";

import { env } from "@/config/env";
import { auth } from "@/lib/auth";
import { signBridgeAccessToken } from "@/lib/insforge-bridge";
import { headers } from "next/headers";

export function createInsforgeServerWithUserId(userId: string): InsForgeClient {
  return createClient({
    baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    accessToken: signBridgeAccessToken(userId),
  });
}

export async function createInsforgeServer(): Promise<InsForgeClient> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return createClient({
      baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
      anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    });
  }

  return createInsforgeServerWithUserId(session.user.id);
}

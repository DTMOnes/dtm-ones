"use client";

import { createBrowserClient } from "@insforge/sdk/ssr";

import { env } from "@/config/env";

/**
 * Browser InsForge client without InsForge Auth refresh.
 * Dashboard identity is Better Auth; data calls use the server bridge token.
 */
export const insforge = createBrowserClient({
  baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

"use client";

import { createClient, type InsForgeClient } from "@insforge/sdk";

import { env } from "@/config/env";

type TokenResponse = {
  token?: string;
  error?: string;
};

/**
 * Browser SDK client seeded with the Better Auth → InsForge bridge JWT.
 * Used for staff storage uploads only; DB writes stay on Server Actions.
 */
export async function createBridgedInsforgeClient(): Promise<InsForgeClient> {
  const response = await fetch("/api/insforge-token", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as TokenResponse | null;

  if (!response.ok || !body?.token) {
    throw new Error(
      body?.error === "Unauthorized"
        ? "Please sign in to continue."
        : "Could not authorize the upload. Please try again.",
    );
  }

  return createClient({
    baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    accessToken: body.token,
  });
}

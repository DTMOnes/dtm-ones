import { DEFAULT_ACCESS_TOKEN_COOKIE } from "@insforge/sdk/ssr/middleware";
import { cookies } from "next/headers";

import { env } from "@/config/env";
import { buildApiError } from "@/lib/api/errors";

/**
 * Server-side fetch for legacy FastAPI data calls until those surfaces move to
 * InsForge. Reads the InsForge access token cookie for the Bearer header.
 *
 * Note: FastAPI will reject InsForge JWTs. Callers that still hit FastAPI will
 * fail until their feature step migrates to InsForge.
 */
type ServerFetchOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | null;
};

async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(DEFAULT_ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function serverApiFetch<T>(
  path: string,
  { body, headers: initHeaders, ...init }: ServerFetchOptions = {},
): Promise<T> {
  const token = await getAccessToken();

  const headers = new Headers(initHeaders);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (body !== undefined && body !== null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${env.API_URL}${path}`, {
    ...init,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

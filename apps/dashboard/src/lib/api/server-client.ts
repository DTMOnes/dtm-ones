// Lib
import { env } from "@/config/env";
import { getAccessToken } from "@/lib/api/cookies";
import { buildApiError } from "@/lib/api/errors";

/**
 * Server-side fetch for Server Components / Server Actions. Reads the access
 * token from httpOnly cookies and calls FastAPI directly with a Bearer header.
 *
 * Note: this does NOT refresh tokens (Server Components cannot set cookies).
 * `proxy.ts` refreshes proactively before requests reach the RSC tree.
 */
type ServerFetchOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | null;
};

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

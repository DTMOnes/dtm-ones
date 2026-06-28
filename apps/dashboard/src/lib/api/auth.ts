// Lib
import { apiFetch } from "@/lib/api/client";
import { buildApiError } from "@/lib/api/errors";
import type { ApiAuthSessionUser } from "@/lib/api/types";

/**
 * Auth login/logout go through the Next BFF route handlers (same origin) so the
 * tokens can be stored in httpOnly cookies the browser never reads.
 */
async function postAuthRoute<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
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

export async function loginWithEmail(payload: {
  email: string;
  password: string;
}) {
  return postAuthRoute<{ user: ApiAuthSessionUser }>("/api/auth/login", payload);
}

export async function getMe() {
  return apiFetch<ApiAuthSessionUser>("/auth/me");
}

export async function logout() {
  await postAuthRoute<{ message: string }>("/api/auth/logout");
}

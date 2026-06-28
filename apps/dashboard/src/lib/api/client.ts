// Lib
import { buildApiError } from "@/lib/api/errors";

/**
 * All client-side data calls hit the same-origin BFF proxy
 * (`app/api/bff/[...path]`), which injects the Bearer token from httpOnly
 * cookies and handles refresh. The browser never sees the token.
 */
const BFF_BASE = "/api/bff";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export async function apiFetch<T>(
  path: string,
  { body, headers: initHeaders, ...init }: RequestOptions = {},
): Promise<T> {
  const isJsonBody =
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams);

  const headers = new Headers(initHeaders);
  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const payload = isJsonBody
    ? JSON.stringify(body)
    : (body as BodyInit | null | undefined);

  const response = await fetch(`${BFF_BASE}${path}`, {
    ...init,
    headers,
    body: payload,
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

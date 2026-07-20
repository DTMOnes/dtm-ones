import { serverApiFetch } from "@/lib/api/server-client";
import type { ApiUser, ApiUserDetail } from "@/lib/api/types";

/**
 * Server-side query functions used for SSR prefetch. They mirror the client
 * `lib/api/*` fetchers but call FastAPI directly (with the cookie token) so the
 * resulting cache entries hydrate the matching client `useQuery` calls.
 */

export function getUsersServer() {
  return serverApiFetch<ApiUser[]>("/users");
}

export function getUserByIdServer(userId: string) {
  return serverApiFetch<ApiUserDetail>(`/users/${userId}`);
}

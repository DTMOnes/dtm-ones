// Lib
import { buildPlayersQuery } from "@/lib/api/players";
import { serverApiFetch } from "@/lib/api/server-client";
import type {
  ApiCategoryDetail,
  ApiCategoryWithCount,
  ApiContactRequest,
  ApiPlayer,
  ApiUser,
  ApiUserDetail,
} from "@/lib/api/types";

/**
 * Server-side query functions used for SSR prefetch. They mirror the client
 * `lib/api/*` fetchers but call FastAPI directly (with the cookie token) so the
 * resulting cache entries hydrate the matching client `useQuery` calls.
 */

export function getPlayersServer(filters: { q?: string; c?: string[] } = {}) {
  return serverApiFetch<ApiPlayer[]>(`/players${buildPlayersQuery(filters)}`);
}

export function getPlayerByIdServer(playerId: string) {
  return serverApiFetch<ApiPlayer>(`/players/${playerId}`);
}

export function getCategoriesServer(q?: string) {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return serverApiFetch<ApiCategoryWithCount[]>(`/categories${query}`);
}

export function getCategoryByIdServer(categoryId: string) {
  return serverApiFetch<ApiCategoryDetail>(`/categories/${categoryId}`);
}

export function getUsersServer() {
  return serverApiFetch<ApiUser[]>("/users");
}

export function getUserByIdServer(userId: string) {
  return serverApiFetch<ApiUserDetail>(`/users/${userId}`);
}

export function getContactRequestsServer() {
  return serverApiFetch<ApiContactRequest[]>("/contact-requests");
}

export async function getContactRequestByIdServer(requestId: string) {
  const requests = await getContactRequestsServer();
  return requests.find((request) => request.id === requestId) ?? null;
}

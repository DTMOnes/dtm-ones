import { apiFetch } from "@/lib/api/client";
import type { ApiMessageResponse, ApiPlayer } from "@/lib/api/types";
import type { CreatePlayerInput, UpdatePlayerInput } from "@/lib/validation/players";

type GetPlayersFilters = {
  q?: string;
  c?: string[];
};

export function buildPlayersQuery({ q, c }: GetPlayersFilters) {
  const params = new URLSearchParams();

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  for (const categoryId of c ?? []) {
    params.append("c", categoryId);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getPlayers(filters: GetPlayersFilters = {}) {
  return apiFetch<ApiPlayer[]>(`/players${buildPlayersQuery(filters)}`);
}

export async function getPlayerById(playerId: string) {
  return apiFetch<ApiPlayer>(`/players/${playerId}`);
}

export async function createPlayer(payload: CreatePlayerInput) {
  return apiFetch<ApiPlayer>("/players", {
    method: "POST",
    body: {
      full_name: payload.fullName,
      height: payload.height,
      date_of_birth: payload.dateOfBirth,
      nationality: payload.nationality,
      last_club: payload.lastClub,
      category_ids: payload.categoryIds,
    },
  });
}

export async function updatePlayer(payload: UpdatePlayerInput) {
  return apiFetch<ApiPlayer>(`/players/${payload.id}`, {
    method: "PATCH",
    body: {
      full_name: payload.fullName,
      height: payload.height,
      date_of_birth: payload.dateOfBirth,
      nationality: payload.nationality,
      last_club: payload.lastClub,
      category_ids: payload.categoryIds,
    },
  });
}

export async function deletePlayer(playerId: string) {
  return apiFetch<ApiMessageResponse>(`/players/${playerId}`, {
    method: "DELETE",
  });
}

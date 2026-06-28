import { apiFetch } from "@/lib/api/client";
import type { ApiMessageResponse, ApiUser, ApiUserDetail, UserRole } from "@/lib/api/types";

export async function getUsers() {
  return apiFetch<ApiUser[]>("/users");
}

export async function getUserById(userId: string) {
  return apiFetch<ApiUserDetail>(`/users/${userId}`);
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  return apiFetch<ApiUser>("/users", {
    method: "POST",
    body: payload,
  });
}

export async function updateUserGeneral(payload: {
  id: string;
  name: string;
  email: string;
}) {
  return apiFetch<ApiUser>(`/users/${payload.id}`, {
    method: "PATCH",
    body: {
      name: payload.name,
      email: payload.email,
    },
  });
}

export async function changeUserPassword(payload: {
  userId: string;
  password: string;
  confirmPassword: string;
}) {
  return apiFetch<ApiMessageResponse>(`/users/${payload.userId}/password`, {
    method: "PATCH",
    body: {
      password: payload.password,
      confirm_password: payload.confirmPassword,
    },
  });
}

export async function setUserRole(payload: { userId: string; role: UserRole }) {
  return apiFetch<ApiMessageResponse>(`/users/${payload.userId}/role`, {
    method: "PATCH",
    body: { role: payload.role },
  });
}

export async function deleteUser(userId: string) {
  return apiFetch<ApiMessageResponse>(`/users/${userId}`, {
    method: "DELETE",
  });
}

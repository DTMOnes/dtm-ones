import type { DashboardRole } from "@/lib/auth/types";

export type BetterAuthPluginRole = "admin" | "user";

export function toPluginRole(role: DashboardRole): BetterAuthPluginRole {
  return role === "owner" ? "admin" : "user";
}

export function roleLabel(role: DashboardRole): string {
  return role === "owner" ? "Owner" : "Staff";
}

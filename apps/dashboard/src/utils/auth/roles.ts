import type { DashboardRole } from "@/lib/auth/types";

export function roleLabel(role: DashboardRole): string {
  return role === "owner" ? "Owner" : "Staff";
}

import type { DashboardRole, DashboardUser } from "@/lib/auth/types";

export function isDashboardRole(
  role: string | null | undefined,
): role is DashboardRole {
  return role === "owner" || role === "staff";
}

export function userFromBetterAuth(user: {
  id: string;
  email?: string | null;
  role?: string | null;
} | null | undefined): DashboardUser | null {
  if (!user?.id || !user.email || !isDashboardRole(user.role)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

import type { DashboardRole } from "@/lib/auth/types";
import { ConflictError } from "@/utils/errors";

export function toDashboardRole(
  role: string | null | undefined,
): DashboardRole | null {
  if (role === "owner" || role === "staff") {
    return role;
  }

  return null;
}

export function isOwnUser(actorId: string, targetId: string): boolean {
  return actorId === targetId;
}

export function isLastOwner(
  role: string | null,
  ownerCount: number,
): boolean {
  return role === "owner" && ownerCount <= 1;
}

export function assertCanSetUserRole({
  actorId,
  targetId,
  targetRole,
  nextRole,
  ownerCount,
}: {
  actorId: string;
  targetId: string;
  targetRole: DashboardRole;
  nextRole: DashboardRole;
  ownerCount: number;
}): void {
  if (nextRole === targetRole) {
    return;
  }

  if (nextRole !== "staff" || targetRole !== "owner") {
    return;
  }

  if (isLastOwner(targetRole, ownerCount)) {
    throw new ConflictError("You cannot change the last Owner to Staff.");
  }

  if (isOwnUser(actorId, targetId)) {
    throw new ConflictError(
      "You cannot change your own role. Another Owner must do it.",
    );
  }
}

export function assertCanDeleteUser({
  actorId,
  targetId,
  targetRole,
  ownerCount,
}: {
  actorId: string;
  targetId: string;
  targetRole: DashboardRole;
  ownerCount: number;
}): void {
  if (isLastOwner(targetRole, ownerCount)) {
    throw new ConflictError("You cannot delete the last Owner.");
  }

  if (isOwnUser(actorId, targetId)) {
    throw new ConflictError(
      "You cannot delete yourself. Another Owner must do it.",
    );
  }
}

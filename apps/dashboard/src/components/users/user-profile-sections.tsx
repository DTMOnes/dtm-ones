"use client";

import { ChangeUserRoleForm } from "@/components/users/change-user-role-form";
import { DeleteUserCard } from "@/components/users/delete-user-card";
import type { DashboardRole } from "@/lib/auth/types";

type UserProfileSectionsProps = {
  user: {
    id: string;
    email: string;
    name: string;
    role: DashboardRole;
  };
  isOnlyOwner: boolean;
};

export function UserProfileSections({
  user,
  isOnlyOwner,
}: UserProfileSectionsProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <ChangeUserRoleForm
        userId={user.id}
        currentRole={user.role}
        isOnlyOwner={isOnlyOwner}
      />
      <DeleteUserCard
        userId={user.id}
        userEmail={user.email}
        userName={user.name}
        isOnlyOwner={isOnlyOwner}
      />
    </div>
  );
}

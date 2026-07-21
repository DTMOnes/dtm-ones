"use client";

import { UserProfileSections } from "@/components/users/user-profile-sections";
import type { DashboardUserDetail } from "@/types/user";

type UserDetailViewProps = {
  user: DashboardUserDetail;
};

export function UserDetailView({ user }: UserDetailViewProps) {
  return (
    <main className="flex flex-col gap-8 p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground text-sm">
            User profile · {user.email}
          </p>
        </div>
      </div>

      <UserProfileSections user={user} isOnlyOwner={user.is_only_owner} />
    </main>
  );
}

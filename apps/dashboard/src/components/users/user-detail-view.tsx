"use client";

// Components
import UserProfileSections from "@/components/users/user-profile-sections";

// Types
import type { ApiUserDetail } from "@/lib/api/types";

export default function UserDetailView({ user }: { user: ApiUserDetail }) {
  return (
    <main className="p-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            User profile · {user.email}
          </p>
        </div>
      </div>

      <UserProfileSections user={user} isOnlyAdmin={user.is_only_admin} />
    </main>
  );
}

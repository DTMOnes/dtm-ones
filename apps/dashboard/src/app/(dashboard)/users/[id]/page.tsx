// Next
import { notFound } from "next/navigation";

// Components
import UserProfileSections from "@/components/users/user-profile-sections";

// Db + Drizzle
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Lib
import { countAdminUsers, isOnlyAdmin } from "@/lib/users/admin-count";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [foundUser, adminCount] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, id),
    }),
    countAdminUsers(),
  ]);

  if (!foundUser) {
    notFound();
  }

  const onlyAdmin = isOnlyAdmin(foundUser, adminCount);

  return (
    <main className="p-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{foundUser.name}</h1>
          <p className="text-sm text-muted-foreground">
            User profile · {foundUser.email}
          </p>
        </div>
      </div>

      <UserProfileSections user={foundUser} isOnlyAdmin={onlyAdmin} />
    </main>
  );
}

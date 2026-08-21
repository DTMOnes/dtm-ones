import { notFound, redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { schema } from "@dtm/database";

import {
  DetailLayout,
  PageHeader,
  PageShell,
} from "@/components/page/page-frame";
import { ChangeUserNameForm } from "@/components/users/change-user-name-form";
import { ChangeUserRoleForm } from "@/components/users/change-user-role-form";
import { DeleteUserCard } from "@/components/users/delete-user-card";
import { db } from "@/lib/db";
import { getSession } from "@/utils/auth/get-session";
import {
  isLastOwner,
  isOwnUser,
  toDashboardRole,
} from "@/utils/auth/owner";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/contacts");
  }

  const [row, [owners]] = await Promise.all([
    db.query.user.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      where: eq(schema.user.id, id),
    }),
    db
      .select({ ownerCount: count() })
      .from(schema.user)
      .where(eq(schema.user.role, "owner")),
  ]);

  const role = toDashboardRole(row?.role);
  if (!row || !role) {
    notFound();
  }

  const ownerCount = Number(owners?.ownerCount ?? 0);
  const lastOwner = isLastOwner(role, ownerCount);
  const viewingSelf = isOwnUser(session.user.id, row.id);

  return (
    <PageShell>
      <PageHeader
        backHref="/users"
        backLabel="Users"
        title={row.name}
        description="User profile"
      />

      <DetailLayout
        main={
          <>
            <ChangeUserNameForm userId={row.id} currentName={row.name} />
            <ChangeUserRoleForm
              userId={row.id}
              currentRole={role}
              isLastOwner={lastOwner}
              isSelf={viewingSelf}
            />
          </>
        }
        rail={
          <DeleteUserCard
            userId={row.id}
            userEmail={row.email}
            userName={row.name}
            isLastOwner={lastOwner}
            isSelf={viewingSelf}
          />
        }
      />
    </PageShell>
  );
}

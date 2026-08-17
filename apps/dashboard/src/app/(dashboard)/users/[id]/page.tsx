import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { schema } from "@dtm/database";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

import { ChangeUserNameForm } from "@/components/users/change-user-name-form";
import { ChangeUserRoleForm } from "@/components/users/change-user-role-form";
import { DeleteUserCard } from "@/components/users/delete-user-card";
import { Button } from "@/components/ui/button";
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

  const [[row], [owners]] = await Promise.all([
    db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        role: schema.user.role,
      })
      .from(schema.user)
      .where(eq(schema.user.id, id))
      .limit(1),
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
    <main className="flex flex-col gap-8 p-10">
      <div className="flex flex-col gap-4">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/users">
            <ArrowLeftIcon />
            Users
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{row.name}</h1>
          <p className="text-muted-foreground text-sm">
            User profile · {row.email}
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-6">
        <ChangeUserNameForm userId={row.id} currentName={row.name} />
        <ChangeUserRoleForm
          userId={row.id}
          currentRole={role}
          isLastOwner={lastOwner}
          isSelf={viewingSelf}
        />
        <DeleteUserCard
          userId={row.id}
          userEmail={row.email}
          userName={row.name}
          isLastOwner={lastOwner}
          isSelf={viewingSelf}
        />
      </div>
    </main>
  );
}

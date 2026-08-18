import Link from "next/link";
import { UserCircleIcon } from "@phosphor-icons/react/ssr";
import { asc, inArray } from "drizzle-orm";
import { schema } from "@dtm/database";

import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { db } from "@/lib/db";
import { toDashboardRole } from "@/utils/auth/owner";

export default async function Page() {
  const rows = await db.query.user.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    where: inArray(schema.user.role, ["owner", "staff"]),
    orderBy: [asc(schema.user.name)],
  });

  const users = rows.flatMap((row) => {
    const role = toDashboardRole(row.role);
    if (!role) {
      return [];
    }

    return [{ ...row, role }];
  });

  return (
    <main className="flex h-full w-full flex-col gap-10 p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <CreateUserDialog />
      </div>

      <ItemGroup className="bg-background flex h-full w-full flex-col gap-4 rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        {users.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserCircleIcon />
              </EmptyMedia>
              <EmptyTitle>No users found</EmptyTitle>
              <EmptyDescription>
                Get started by creating a new user with the &quot;New user&quot;
                button.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          users.map((user) => (
            <Item key={user.id} variant="muted" asChild>
              <Link
                href={`/users/${user.id}`}
                className="flex w-full items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{user.name}</ItemTitle>
                  <ItemDescription>{user.email}</ItemDescription>
                </ItemContent>
                <Badge variant="secondary">
                  {user.role === "owner" ? "Owner" : "Staff"}
                </Badge>
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}

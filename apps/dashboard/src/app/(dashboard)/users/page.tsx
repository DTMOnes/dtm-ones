import Link from "next/link";
import { UserCircleIcon } from "@phosphor-icons/react/ssr";
import { asc, inArray } from "drizzle-orm";
import { schema } from "@dtm/database";

import {
  ListEmpty,
  ListRowAvatar,
  ListRowChevron,
  ListRowMeta,
  PageHeader,
  PageShell,
} from "@/components/page/page-frame";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import {
  Item,
  ItemActions,
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
    <PageShell>
      <PageHeader
        title="Users"
        description="Owners and Staff who sign in."
        actions={<CreateUserDialog />}
      />

      {users.length === 0 ? (
        <ListEmpty
          icon={UserCircleIcon}
          title="No users found"
          description='Get started by creating a new user with the "New user" button.'
        />
      ) : (
        <ItemGroup>
          {users.map((user) => (
            <Item key={user.id} variant="muted" asChild>
              <Link href={`/users/${user.id}`}>
                <ListRowAvatar name={user.name} />
                <ItemContent>
                  <ItemTitle>{user.name}</ItemTitle>
                  <ItemDescription>{user.email}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ListRowMeta>
                    {user.role === "owner" ? "Owner" : "Staff"}
                  </ListRowMeta>
                  <ListRowChevron />
                </ItemActions>
              </Link>
            </Item>
          ))}
        </ItemGroup>
      )}
    </PageShell>
  );
}

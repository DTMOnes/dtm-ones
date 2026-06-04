// Next
import Link from "next/link";

// Components
import CreateUserDialog from "@/components/users/create-user-dialog";

// Db + Drizzle
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Shadcn
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

// Phosphor
import { UserCircleIcon } from "@phosphor-icons/react/ssr";

export default async function Page() {
  const allUsers = await db.query.user.findMany({
    orderBy: [desc(user.createdAt)],
  });

  return (
    <main className="w-full h-full p-10 flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <CreateUserDialog />
      </div>

      <ItemGroup className="w-full h-full p-4 flex flex-col gap-4 rounded-lg border border-border bg-background shadox-xs dark:border-input dark:bg-input/30">
        {allUsers.length === 0 ? (
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
          allUsers.map((user) => (
            <Item key={user.id} variant="muted" asChild>
              <Link
                href={`/users/${user.id}`}
                className="w-full flex items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{user.name}</ItemTitle>
                  <ItemDescription>{user.email}</ItemDescription>
                </ItemContent>
                <Badge variant="secondary">{user.role?.toUpperCase()}</Badge>
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}

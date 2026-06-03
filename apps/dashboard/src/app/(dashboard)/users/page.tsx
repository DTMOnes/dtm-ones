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

function formatDate(value: Date) {
  return value.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function roleLabel(role: string | null) {
  if (role === "admin") return "Administrator";
  return "User";
}

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
          allUsers.map((foundUser) => (
            <Item key={foundUser.id} variant="muted" asChild>
              <Link
                href={`/users/${foundUser.id}`}
                className="w-full flex items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{foundUser.name}</ItemTitle>
                  <ItemDescription>
                    {foundUser.email} · Joined:{" "}
                    {formatDate(foundUser.createdAt)}
                  </ItemDescription>
                </ItemContent>
                <Badge variant="secondary">
                  {roleLabel(foundUser.role ?? null)}
                </Badge>
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}

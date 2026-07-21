"use client";

import Link from "next/link";

import { UserCircleIcon } from "@phosphor-icons/react/ssr";

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
import { roleLabel } from "@/lib/users/roles";
import type { DashboardUserRow } from "@/types/user";

type UsersListViewProps = {
  users: DashboardUserRow[];
};

export function UsersListView({ users }: UsersListViewProps) {
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
                <Badge variant="secondary">{roleLabel(user.role)}</Badge>
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}

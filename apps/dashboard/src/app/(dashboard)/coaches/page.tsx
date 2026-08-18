import { Suspense } from "react";
import Link from "next/link";
import { StrategyIcon } from "@phosphor-icons/react/ssr";
import { and, asc, eq, ilike, isNull } from "drizzle-orm";
import { schema } from "@dtm/database";

import { CreateCoachDialog } from "@/components/coaches/create-coach-dialog";
import SearchBar from "@/components/players/search-bar";
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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const coaches = await db.query.clients.findMany({
    columns: {
      id: true,
      name: true,
      nationality: true,
      lastClub: true,
      visibility: true,
    },
    where: and(
      eq(schema.clients.kind, "coach"),
      isNull(schema.clients.trashedAt),
      q ? ilike(schema.clients.name, `%${q}%`) : undefined,
    ),
    orderBy: [asc(schema.clients.name)],
  });

  return (
    <main className="flex h-full w-full flex-col gap-10 p-10">
      <h1 className="text-2xl font-bold">Coaches</h1>

      <div className="flex items-center gap-2">
        <Suspense>
          <SearchBar placeholder="Search coaches by name..." />
        </Suspense>
        <CreateCoachDialog />
      </div>

      <ItemGroup className="bg-background flex h-full w-full flex-col gap-4 rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        {coaches.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <StrategyIcon />
              </EmptyMedia>
              <EmptyTitle>No coaches found</EmptyTitle>
              <EmptyDescription>
                Get started by creating a new coach with the &quot;New
                coach&quot; button.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          coaches.map((coach) => (
            <Item key={coach.id} variant="muted" asChild>
              <Link
                href={`/coaches/${coach.id}`}
                className="flex w-full items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{coach.name}</ItemTitle>
                  <ItemDescription>
                    {[
                      coach.nationality,
                      coach.lastClub,
                      coach.visibility === "public" ? "Public" : "Private",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </ItemDescription>
                </ItemContent>
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}

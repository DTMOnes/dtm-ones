import { Suspense } from "react";
import Link from "next/link";
import { UserIcon } from "@phosphor-icons/react/ssr";
import { and, asc, eq, ilike, inArray, isNull } from "drizzle-orm";
import { schema } from "@dtm/database";

import { CreatePlayerDialog } from "@/components/players/create-player-dialog";
import FilterButton from "@/components/players/filter-button";
import { normalizePlayerCategoryIds } from "@/components/players/players-search";
import SearchBar from "@/components/players/search-bar";
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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const rawC = sp.c === undefined ? [] : Array.isArray(sp.c) ? sp.c : [sp.c];
  const categoryIds = normalizePlayerCategoryIds(rawC);

  const [players, categories] = await Promise.all([
    db.query.clients.findMany({
      columns: {
        id: true,
        name: true,
        nationality: true,
        heightCm: true,
        visibility: true,
      },
      where: and(
        eq(schema.clients.kind, "player"),
        isNull(schema.clients.trashedAt),
        q ? ilike(schema.clients.name, `%${q}%`) : undefined,
        categoryIds.length > 0
          ? inArray(schema.clients.categoryId, categoryIds)
          : undefined,
      ),
      orderBy: [asc(schema.clients.name)],
      with: {
        category: {
          columns: {
            name: true,
          },
        },
      },
    }),
    db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
      },
      orderBy: [asc(schema.categories.name)],
    }),
  ]);

  return (
    <main className="flex h-full w-full flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Players</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1 basis-48">
            <Suspense>
              <SearchBar placeholder="Search players by name..." />
            </Suspense>
          </div>
          <div className="flex items-center gap-2">
            <Suspense>
              <FilterButton categories={categories} />
            </Suspense>
            <CreatePlayerDialog categories={categories} />
          </div>
        </div>
      </div>

      <ItemGroup className="bg-background flex h-full w-full flex-col gap-4 rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        {players.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserIcon />
              </EmptyMedia>
              <EmptyTitle>No players found</EmptyTitle>
              <EmptyDescription>
                Get started by creating a new player with the &quot;New
                player&quot; button.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          players.map((player) => (
            <Item key={player.id} variant="muted" asChild>
              <Link
                href={`/players/${player.id}`}
                className="flex w-full items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{player.name}</ItemTitle>
                  <ItemDescription>
                    {[
                      player.heightCm != null ? `${player.heightCm} cm` : null,
                      player.nationality,
                      player.visibility === "public" ? "Public" : "Private",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </ItemDescription>
                </ItemContent>
                {player.category?.name ? (
                  <Badge>{player.category.name}</Badge>
                ) : null}
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}

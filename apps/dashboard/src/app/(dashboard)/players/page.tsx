import { Suspense } from "react";
import Link from "next/link";
import { UserIcon } from "@phosphor-icons/react/ssr";
import { and, asc, eq, ilike, inArray, isNull } from "drizzle-orm";
import { schema } from "@dtm/database";

import {
  ListEmpty,
  ListRowChevron,
  ListRowMeta,
  PageHeader,
  PageShell,
  PageToolbar,
} from "@/components/page/page-frame";
import { CreatePlayerDialog } from "@/components/players/create-player-dialog";
import FilterButton from "@/components/players/filter-button";
import { normalizePlayerCategoryIds } from "@/components/players/players-search";
import SearchBar from "@/components/players/search-bar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { db } from "@/lib/db";
import { listFacts, visibilityLabel } from "@/utils/list-row";

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
    <PageShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Players"
          description="Players the agency represents."
          actions={<CreatePlayerDialog categories={categories} />}
        />
        <PageToolbar>
          <div className="min-w-0 flex-1 basis-48">
            <Suspense>
              <SearchBar placeholder="Search players by name..." />
            </Suspense>
          </div>
          <Suspense>
            <FilterButton categories={categories} />
          </Suspense>
        </PageToolbar>
      </div>

      {players.length === 0 ? (
        <ListEmpty
          icon={UserIcon}
          title="No players found"
          description='Get started by creating a new player with the "New player" button.'
        />
      ) : (
        <ItemGroup>
          {players.map((player) => {
            const facts = listFacts(
              player.heightCm != null ? `${player.heightCm} cm` : null,
              player.nationality,
            );

            return (
              <Item key={player.id} variant="muted" asChild>
                <Link href={`/players/${player.id}`}>
                  <ItemContent>
                    <ItemTitle>{player.name}</ItemTitle>
                    {facts ? (
                      <ItemDescription>{facts}</ItemDescription>
                    ) : null}
                  </ItemContent>
                  <ItemActions>
                    {player.category?.name ? (
                      <ListRowMeta>{player.category.name}</ListRowMeta>
                    ) : null}
                    <ListRowMeta>
                      {visibilityLabel(player.visibility)}
                    </ListRowMeta>
                    <ListRowChevron />
                  </ItemActions>
                </Link>
              </Item>
            );
          })}
        </ItemGroup>
      )}
    </PageShell>
  );
}

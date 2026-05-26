// Next
import Link from "next/link";

// Components
import CreatePlayerDialog from "@/components/dashboard/players/create-player-dialog";
import FilterButton from "@/components/dashboard/players/filter-button";
import SearchBar from "@/components/dashboard/players/search-bar";

// Db + Drizzle
import { db } from "@/lib/db";
import { players, playerCategories } from "@/lib/db/schema";
import { and, desc, eq, exists, ilike } from "drizzle-orm";

// Shadcn
import {
  ItemGroup,
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card } from "@/components/ui/card";

// Phosphor
import { FolderOpenIcon } from "@phosphor-icons/react/ssr";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string | string[] }>;
}) {
  const { q, c } = await searchParams;

  const raw = c === undefined ? [] : Array.isArray(c) ? c : [c];

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const categoriesArray = [...new Set(raw.filter((id) => uuidRegex.test(id)))];

  const allPlayers = await db.query.players.findMany({
    where: and(
      ilike(players.fullName, `%${q?.trim() ?? ""}%`),
      ...categoriesArray.map((categoryId) =>
        exists(
          db
            .select({ id: playerCategories.playerId })
            .from(playerCategories)
            .where(
              and(
                eq(playerCategories.playerId, players.id),
                eq(playerCategories.categoryId, categoryId),
              ),
            ),
        ),
      ),
    ),
    orderBy: [desc(players.createdAt)],
    with: {
      playerCategories: {
        with: {
          category: true, // <- incluye id, name, etc.
        },
      },
    },
  });

  const allCategories = await db.query.categories.findMany();

  return (
    <main className="w-full h-full p-10 flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Players list</h1>

      <div className="flex items-center gap-10">
        <SearchBar />

        <div className="flex items-center gap-2">
          <FilterButton categories={allCategories} />
          <CreatePlayerDialog categories={allCategories} />
        </div>
      </div>

      <ItemGroup className="w-full h-full p-4 flex flex-col gap-4 rounded-lg border border-border bg-background shadox-xs dark:border-input dark:bg-input/30">
        {allPlayers.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpenIcon />
              </EmptyMedia>
              <EmptyTitle>No players found</EmptyTitle>
              <EmptyDescription>
                Create a new player to get started.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          allPlayers.map((player) => (
            <Item key={player.id} variant="muted" asChild>
              <Link
                href={`/dashboard/players/${player.id}`}
                className="w-full flex items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{player.fullName}</ItemTitle>
                  <ItemDescription>
                    Last club: {player.lastClub} - Birth date:{" "}
                    {player.dateOfBirth}
                  </ItemDescription>
                </ItemContent>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {player.playerCategories.map(({ category }) => (
                    <Badge key={category.id}>{category.name}</Badge>
                  ))}
                </div>
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}

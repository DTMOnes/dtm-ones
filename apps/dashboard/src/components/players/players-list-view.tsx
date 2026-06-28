"use client";

// Next
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Components
import CreatePlayerDialog from "@/components/players/create-player-dialog";
import FilterButton from "@/components/players/filter-button";
import SearchBar from "@/components/players/search-bar";
import { normalizePlayerCategoryIds } from "@/components/players/players-search";
import { Spinner } from "@/components/ui/spinner";
import { useCategoriesQuery } from "@/hooks/api/use-categories";
import { usePlayersQuery } from "@/hooks/api/use-players";

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
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Phosphor
import { FolderOpenIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr";

export default function PlayersListView() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const categoriesArray = normalizePlayerCategoryIds(searchParams.getAll("c"));

  const { data: allCategories = [], isLoading: categoriesLoading } =
    useCategoriesQuery("");
  const {
    data: allPlayers = [],
    isLoading: playersLoading,
    isError,
  } = usePlayersQuery({ q, c: categoriesArray });

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
        {playersLoading || categoriesLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WarningCircleIcon />
              </EmptyMedia>
              <EmptyTitle>Could not load players</EmptyTitle>
              <EmptyDescription>
                Something went wrong while fetching players. Please try again.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : allPlayers.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpenIcon />
              </EmptyMedia>
              <EmptyTitle>No players found</EmptyTitle>
              <EmptyDescription>
                You can start by creating a new player.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          allPlayers.map((player) => (
            <Item key={player.id} variant="muted" asChild>
              <Link
                href={`/players/${player.id}`}
                className="w-full flex items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{player.full_name}</ItemTitle>
                  <ItemDescription>
                    Last club: {player.last_club} - Birth date:{" "}
                    {player.date_of_birth}
                  </ItemDescription>
                </ItemContent>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {player.categories.map((category) => (
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

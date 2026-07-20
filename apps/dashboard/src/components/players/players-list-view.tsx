"use client";

import Link from "next/link";

import CreatePlayerDialog from "@/components/players/create-player-dialog";
import FilterButton from "@/components/players/filter-button";
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
import type { CategoryWithCount } from "@/types/category";
import type { PlayerListItem } from "@/types/player";

import { FolderOpenIcon } from "@phosphor-icons/react/ssr";

type PlayersListViewProps = {
  players: PlayerListItem[];
  categories: CategoryWithCount[];
};

export default function PlayersListView({
  players,
  categories,
}: PlayersListViewProps) {
  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <main className="w-full h-full p-10 flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Players list</h1>

      <div className="flex items-center gap-10">
        <SearchBar />

        <div className="flex items-center gap-2">
          <FilterButton categories={categoryOptions} />
          <CreatePlayerDialog categories={categoryOptions} />
        </div>
      </div>

      <ItemGroup className="w-full h-full p-4 flex flex-col gap-4 rounded-lg border border-border bg-background shadox-xs dark:border-input dark:bg-input/30">
        {players.length === 0 ? (
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
          players.map((player) => (
            <Item key={player.id} variant="muted" asChild>
              <Link
                href={`/players/${player.id}`}
                className="w-full flex items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{player.full_name}</ItemTitle>
                  <ItemDescription>
                    {player.height_cm} cm · {player.nationality} ·{" "}
                    {player.status === "published" ? "Published" : "Draft"}
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

"use client";

// Next
import Link from "next/link";

// Components
import DeletePlayerButton from "@/components/categories/delete-player-button";

// Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

// Phosphor
import { UserIcon } from "@phosphor-icons/react";

type Player = {
  id: string;
  fullName: string;
  lastClub: string;
};

type CategoryPlayersProps = {
  categoryId: string;
  players: Player[];
};

export default function CategoryPlayers({
  categoryId,
  players,
}: CategoryPlayersProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Players in the category</CardTitle>
        <CardDescription>
          Players assigned to this category. You can open their profile or
          remove them from the group.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        {players.length === 0 ? (
          <Empty className="border-none py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserIcon />
              </EmptyMedia>
              <EmptyTitle>No players</EmptyTitle>
              <EmptyDescription>
                No players have been assigned to this category yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="gap-2">
            {players.map((player) => (
              <Item
                key={player.id}
                variant="muted"
                className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <ItemContent>
                  <ItemTitle>
                    <Link
                      href={`/players/${player.id}`}
                      className="hover:underline"
                    >
                      {player.fullName}
                    </Link>
                  </ItemTitle>
                  <ItemDescription>
                    Last club: {player.lastClub}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="gap-2 justify-end sm:shrink-0">
                  <DeletePlayerButton categoryId={categoryId} player={player} />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}

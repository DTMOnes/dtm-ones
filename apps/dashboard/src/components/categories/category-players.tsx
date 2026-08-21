import Link from "next/link";
import { UserIcon } from "@phosphor-icons/react/ssr";

import {
  Card,
  CardAction,
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
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { CategoryPlayerSummary } from "@/types/category";

type CategoryPlayersProps = {
  players: CategoryPlayerSummary[];
};

export function CategoryPlayers({ players }: CategoryPlayersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
        <CardAction>
          <span className="text-muted-foreground text-sm font-medium">
            {players.length}
          </span>
        </CardAction>
        <CardDescription>
          Players who have this Category. A Category cannot be deleted while any
          Player has it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <Empty className="min-h-36 border border-dashed py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserIcon />
              </EmptyMedia>
              <EmptyTitle>No players</EmptyTitle>
              <EmptyDescription>
                No Player has this Category yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <Item key={player.id} variant="muted" asChild>
                <Link
                  href={`/players/${player.id}`}
                  className="flex w-full items-start justify-between gap-4"
                >
                  <ItemContent>
                    <ItemTitle>{player.name}</ItemTitle>
                    <ItemDescription>Last club: {player.lastClub}</ItemDescription>
                  </ItemContent>
                </Link>
              </Item>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import Link from "next/link";

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
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import type { CategoryPlayerSummary } from "@/types/category";

import { UserIcon } from "@phosphor-icons/react/ssr";

type CategoryPlayersProps = {
  players: CategoryPlayerSummary[];
};

export function CategoryPlayers({ players }: CategoryPlayersProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Players in the category</CardTitle>
        <CardDescription>
          Players who have this Category. A Category cannot be deleted while any
          Player has it.
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
                No Player has this Category yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="gap-2">
            {players.map((player) => (
              <Item key={player.id} variant="muted">
                <ItemContent>
                  <ItemTitle>
                    <Link
                      href={`/players/${player.id}`}
                      className="hover:underline"
                    >
                      {player.name}
                    </Link>
                  </ItemTitle>
                  <ItemDescription>Last club: {player.lastClub}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}

import { TrashIcon } from "@phosphor-icons/react/ssr";
import { desc, isNotNull } from "drizzle-orm";
import { schema } from "@dtm/database";

import { TrashClientActions } from "@/components/trash/trash-client-actions";
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
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { db } from "@/lib/db";

export default async function Page() {
  const clients = await db.query.clients.findMany({
    columns: {
      id: true,
      kind: true,
      name: true,
      nationality: true,
      visibility: true,
    },
    where: isNotNull(schema.clients.trashedAt),
    orderBy: [desc(schema.clients.trashedAt)],
  });

  return (
    <main className="flex h-full w-full flex-col gap-10 p-10">
      <h1 className="text-2xl font-bold">Trash</h1>

      <ItemGroup className="bg-background flex h-full w-full flex-col gap-4 rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        {clients.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TrashIcon />
              </EmptyMedia>
              <EmptyTitle>No Clients in the Trash</EmptyTitle>
              <EmptyDescription>
                Removed Players and Coaches appear here. Restore keeps
                Visibility. Delete destroys the Client.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          clients.map((client) => {
            const kindLabel = client.kind === "player" ? "Player" : "Coach";
            const visibilityLabel =
              client.visibility === "public" ? "Public" : "Private";

            return (
              <Item key={client.id} variant="muted" className="justify-between gap-4">
                <ItemContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <ItemTitle>{client.name}</ItemTitle>
                    <Badge variant="secondary">{kindLabel}</Badge>
                  </div>
                  <ItemDescription>
                    {[client.nationality, visibilityLabel]
                      .filter(Boolean)
                      .join(" · ")}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <TrashClientActions
                    clientId={client.id}
                    clientName={client.name}
                  />
                </ItemActions>
              </Item>
            );
          })
        )}
      </ItemGroup>
    </main>
  );
}

import { TrashIcon } from "@phosphor-icons/react/ssr";
import { desc, isNotNull } from "drizzle-orm";
import { schema } from "@dtm/database";

import {
  ListEmpty,
  ListRowAvatar,
  ListRowMeta,
  PageHeader,
  PageShell,
} from "@/components/page/page-frame";
import { TrashClientActions } from "@/components/trash/trash-client-actions";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { db } from "@/lib/db";
import { clientDisplayName, kindLabel } from "@/utils/clients";
import { listFacts, visibilityLabel } from "@/utils/list-row";

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
    <PageShell>
      <PageHeader
        title="Trash"
        description="Removed Players and Coaches."
      />

      {clients.length === 0 ? (
        <ListEmpty
          icon={TrashIcon}
          title="No Clients in the Trash"
          description="Removed Players and Coaches appear here. Restore keeps Visibility. Delete destroys the Client."
        />
      ) : (
        <ItemGroup>
          {clients.map((client) => {
            const facts = listFacts(kindLabel(client.kind), client.nationality);

            return (
              <Item key={client.id} variant="muted" className="max-sm:flex-wrap">
                <ListRowAvatar name={client.name} />
                <ItemContent>
                  <ItemTitle>
                    {clientDisplayName(client.kind, client.name)}
                  </ItemTitle>
                  {facts ? <ItemDescription>{facts}</ItemDescription> : null}
                </ItemContent>
                <ItemActions className="max-sm:w-full max-sm:justify-end">
                  <ListRowMeta>
                    {visibilityLabel(client.visibility)}
                  </ListRowMeta>
                  <TrashClientActions
                    clientId={client.id}
                    clientName={clientDisplayName(client.kind, client.name)}
                  />
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      )}
    </PageShell>
  );
}

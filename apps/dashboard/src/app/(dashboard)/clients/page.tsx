import { Suspense } from "react";
import Link from "next/link";
import { UsersIcon } from "@phosphor-icons/react/ssr";

import { CreateClientDialog } from "@/components/clients/create-client-dialog";
import { ParamFilter } from "@/components/clients/param-filter";
import {
  ListEmpty,
  ListRowAvatar,
  ListRowChevron,
  ListRowMeta,
  PageHeader,
  PageShell,
  PageToolbar,
} from "@/components/page/page-frame";
import SearchBar from "@/components/players/search-bar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import {
  clientDisplayName,
  kindLabel,
  listClients,
  type ClientKind,
} from "@/utils/clients";
import { visibilityLabel } from "@/utils/list-row";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string; visibility?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const kind: ClientKind | undefined =
    sp.kind === "player" || sp.kind === "coach" ? sp.kind : undefined;
  const visibility =
    sp.visibility === "public" || sp.visibility === "private"
      ? sp.visibility
      : undefined;

  const clients = await listClients(db, {
    kind,
    visibility,
    q: q || undefined,
  });

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Clients"
          description="Players and Coaches the agency represents."
          actions={<CreateClientDialog />}
        />
        <PageToolbar>
          <div className="min-w-0 flex-1 basis-48">
            <Suspense>
              <SearchBar placeholder="Search clients by name..." />
            </Suspense>
          </div>
          <Suspense>
            <ParamFilter
              param="kind"
              label="Type"
              options={[
                { value: "player", label: "Player" },
                { value: "coach", label: "Coach" },
              ]}
            />
          </Suspense>
          <Separator orientation="vertical" className="mx-1" />
          <Suspense>
            <ParamFilter
              param="visibility"
              label="Visibility"
              options={[
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
              ]}
            />
          </Suspense>
        </PageToolbar>
      </div>

      {clients.length === 0 ? (
        <ListEmpty
          icon={UsersIcon}
          title="No Clients found"
          description='Create a Client with the "New Client" button.'
        />
      ) : (
        <ItemGroup>
          {clients.map((client) => (
            <Item key={client.id} variant="muted" asChild>
              <Link href={`/clients/${client.id}`}>
                <ListRowAvatar name={client.name} />
                <ItemContent>
                  <ItemTitle>
                    {clientDisplayName(client.kind, client.name)}
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ListRowMeta>{kindLabel(client.kind)}</ListRowMeta>
                  <ListRowMeta>
                    {visibilityLabel(client.visibility)}
                  </ListRowMeta>
                  <ListRowChevron />
                </ItemActions>
              </Link>
            </Item>
          ))}
        </ItemGroup>
      )}
    </PageShell>
  );
}

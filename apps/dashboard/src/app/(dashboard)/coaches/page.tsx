import { Suspense } from "react";
import Link from "next/link";
import { StrategyIcon } from "@phosphor-icons/react/ssr";
import { and, asc, eq, ilike, isNull } from "drizzle-orm";
import { schema } from "@dtm/database";

import { CreateCoachDialog } from "@/components/coaches/create-coach-dialog";
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
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { db } from "@/lib/db";
import { listFacts, visibilityLabel } from "@/utils/list-row";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const coaches = await db.query.clients.findMany({
    columns: {
      id: true,
      name: true,
      nationality: true,
      lastClub: true,
      visibility: true,
    },
    where: and(
      eq(schema.clients.kind, "coach"),
      isNull(schema.clients.trashedAt),
      q ? ilike(schema.clients.name, `%${q}%`) : undefined,
    ),
    orderBy: [asc(schema.clients.name)],
  });

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Coaches"
          description="Coaches the agency represents."
          actions={<CreateCoachDialog />}
        />
        <PageToolbar>
          <div className="min-w-0 flex-1 basis-48">
            <Suspense>
              <SearchBar placeholder="Search coaches by name..." />
            </Suspense>
          </div>
        </PageToolbar>
      </div>

      {coaches.length === 0 ? (
        <ListEmpty
          icon={StrategyIcon}
          title="No coaches found"
          description='Get started by creating a new coach with the "New coach" button.'
        />
      ) : (
        <ItemGroup>
          {coaches.map((coach) => {
            const facts = listFacts(coach.nationality, coach.lastClub);

            return (
              <Item key={coach.id} variant="muted" asChild>
                <Link href={`/coaches/${coach.id}`}>
                  <ListRowAvatar name={coach.name} />
                  <ItemContent>
                    <ItemTitle>{coach.name}</ItemTitle>
                    {facts ? (
                      <ItemDescription>{facts}</ItemDescription>
                    ) : null}
                  </ItemContent>
                  <ItemActions>
                    <ListRowMeta>
                      {visibilityLabel(coach.visibility)}
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

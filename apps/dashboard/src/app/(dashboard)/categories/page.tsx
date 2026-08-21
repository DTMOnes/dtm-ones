import { Suspense } from "react";
import Link from "next/link";
import { TagSimpleIcon } from "@phosphor-icons/react/ssr";
import { and, asc, count, eq, ilike } from "drizzle-orm";
import { schema } from "@dtm/database";

import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";
import {
  ListEmpty,
  ListRowChevron,
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
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { db } from "@/lib/db";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const rows = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      playerCount: count(schema.clients.id),
    })
    .from(schema.categories)
    .leftJoin(
      schema.clients,
      and(
        eq(schema.clients.categoryId, schema.categories.id),
        eq(schema.clients.kind, "player"),
      ),
    )
    .where(q ? ilike(schema.categories.name, `%${q}%`) : undefined)
    .groupBy(schema.categories.id, schema.categories.name)
    .orderBy(asc(schema.categories.name));

  const categories = rows.map((row) => ({
    ...row,
    playerCount: Number(row.playerCount),
  }));

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Categories"
          description="Court positions for Players."
          actions={<CreateCategoryDialog />}
        />
        <PageToolbar>
          <div className="min-w-0 flex-1 basis-48">
            <Suspense>
              <SearchBar placeholder="Search categories by name..." />
            </Suspense>
          </div>
        </PageToolbar>
      </div>

      {categories.length === 0 ? (
        <ListEmpty
          icon={TagSimpleIcon}
          title="No categories found"
          description='Get started by creating a new category with the "New category" button.'
        />
      ) : (
        <ItemGroup>
          {categories.map((category) => (
            <Item key={category.id} variant="muted" asChild>
              <Link href={`/categories/${category.id}`}>
                <ItemMedia variant="icon">
                  <TagSimpleIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{category.name}</ItemTitle>
                  <ItemDescription>
                    {category.playerCount}{" "}
                    {category.playerCount === 1 ? "player" : "players"}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
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

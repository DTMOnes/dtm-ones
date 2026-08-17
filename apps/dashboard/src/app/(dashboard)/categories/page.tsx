import { Suspense } from "react";
import Link from "next/link";
import { TagSimpleIcon } from "@phosphor-icons/react/ssr";
import { and, asc, count, eq, ilike } from "drizzle-orm";
import { schema } from "@dtm/database";

import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";
import SearchBar from "@/components/players/search-bar";
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
    <main className="flex h-full w-full flex-col gap-10 p-10">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="flex items-center gap-2">
        <Suspense>
          <SearchBar placeholder="Search categories by name..." />
        </Suspense>
        <CreateCategoryDialog />
      </div>

      <ItemGroup className="bg-background flex h-full w-full flex-col gap-4 rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        {categories.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TagSimpleIcon />
              </EmptyMedia>
              <EmptyTitle>No categories found</EmptyTitle>
              <EmptyDescription>
                Get started by creating a new category with the &quot;New
                category&quot; button.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          categories.map((category) => (
            <Item key={category.id} variant="muted" asChild>
              <Link
                href={`/categories/${category.id}`}
                className="flex w-full items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{category.name}</ItemTitle>
                  <ItemDescription>
                    {category.playerCount}{" "}
                    {category.playerCount === 1 ? "player" : "players"}
                  </ItemDescription>
                </ItemContent>
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}

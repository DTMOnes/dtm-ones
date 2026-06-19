// Next
import Link from "next/link";

// Components
import CreateCategoryDialog from "@/components/categories/create-category-dialog";
import SearchBar from "@/components/players/search-bar";

// Db
import { db } from "@/lib/db";
import { categories } from "@dtm/db/schema";
import { desc, ilike } from "drizzle-orm";

// Shadcn
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

// Phosphor
import { TagSimpleIcon } from "@phosphor-icons/react/ssr";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const allCategories = await db.query.categories.findMany({
    where: ilike(categories.name, `%${q?.trim() ?? ""}%`),
    orderBy: [desc(categories.createdAt)],
    with: {
      playerCategories: true,
    },
  });

  return (
    <main className="w-full h-full p-10 flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="flex items-center gap-2">
        <SearchBar placeholder="Buscar categoría por nombre..." />
        <CreateCategoryDialog />
      </div>

      <ItemGroup className="w-full h-full p-4 flex flex-col gap-4 rounded-lg border border-border bg-background shadox-xs dark:border-input dark:bg-input/30">
        {allCategories.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TagSimpleIcon />
              </EmptyMedia>
              <EmptyTitle>No categories found</EmptyTitle>
              <EmptyDescription>
                Add a category with &quot;New category&quot; to start
                classifying players.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          allCategories.map((category) => (
            <Item key={category.id} variant="muted" asChild>
              <Link
                href={`/categories/${category.id}`}
                className="w-full flex items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{category.name}</ItemTitle>
                  <ItemDescription>
                    {category.playerCategories.length} players
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

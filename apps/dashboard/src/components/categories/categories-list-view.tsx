"use client";

import Link from "next/link";

import CreateCategoryDialog from "@/components/categories/create-category-dialog";
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
import type { CategoryWithCount } from "@/types/category";

import { TagSimpleIcon } from "@phosphor-icons/react/ssr";

type CategoriesListViewProps = {
  categories: CategoryWithCount[];
};

export default function CategoriesListView({
  categories,
}: CategoriesListViewProps) {
  return (
    <main className="w-full h-full p-10 flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="flex items-center gap-2">
        <SearchBar placeholder="Buscar categoría por nombre..." />
        <CreateCategoryDialog />
      </div>

      <ItemGroup className="w-full h-full p-4 flex flex-col gap-4 rounded-lg border border-border bg-background shadox-xs dark:border-input dark:bg-input/30">
        {categories.length === 0 ? (
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
          categories.map((category) => (
            <Item key={category.id} variant="muted" asChild>
              <Link
                href={`/categories/${category.id}`}
                className="w-full flex items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{category.name}</ItemTitle>
                  <ItemDescription>
                    {category.player_count} players
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

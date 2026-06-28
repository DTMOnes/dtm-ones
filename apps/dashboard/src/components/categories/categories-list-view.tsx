"use client";

// Next
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Components
import CreateCategoryDialog from "@/components/categories/create-category-dialog";
import SearchBar from "@/components/players/search-bar";

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
import { Spinner } from "@/components/ui/spinner";
import { useCategoriesQuery } from "@/hooks/api/use-categories";

// Phosphor
import { TagSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr";

export default function CategoriesListView() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const { data: allCategories = [], isLoading, isError } = useCategoriesQuery(q);

  return (
    <main className="w-full h-full p-10 flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="flex items-center gap-2">
        <SearchBar placeholder="Buscar categoría por nombre..." />
        <CreateCategoryDialog />
      </div>

      <ItemGroup className="w-full h-full p-4 flex flex-col gap-4 rounded-lg border border-border bg-background shadox-xs dark:border-input dark:bg-input/30">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WarningCircleIcon />
              </EmptyMedia>
              <EmptyTitle>Could not load categories</EmptyTitle>
              <EmptyDescription>
                Something went wrong while fetching categories. Please try again.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : allCategories.length === 0 ? (
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

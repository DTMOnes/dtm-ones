// Db
import { db } from "@/lib/db";
import { playerCategories } from "@/lib/db/schema";
import { count } from "drizzle-orm";

// Shadcn
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

// Phosphor
import {
  PencilSimpleIcon,
  TagSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react/ssr";

import CreateCategoryDialog from "@/components/dashboard/categories/create-category-dialog";

export default async function Page() {
  const allCategories = await db.query.categories.findMany({
    with: {
      playerCategories: true,
    },
  });

  return (
    <main className="p-10 flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <CreateCategoryDialog />
      </div>

      {allCategories.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TagSimpleIcon />
            </EmptyMedia>
            <EmptyTitle>No hay categorías</EmptyTitle>
            <EmptyDescription>
              Añade una categoría con &quot;Nueva categoría&quot; para empezar a
              clasificar jugadores.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {allCategories.map((category) => (
            <Item
              key={category.id}
              variant="muted"
              className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <ItemContent>
                <ItemTitle>{category.name}</ItemTitle>
                <ItemDescription>
                  {category.playerCategories.length} jugadores
                </ItemDescription>
              </ItemContent>
              <ItemActions className="gap-2 justify-end sm:shrink-0">
                <Button
                  variant="outline"
                  size="icon-sm"
                  type="button"
                  aria-label="Editar categoría"
                >
                  <PencilSimpleIcon />
                </Button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  type="button"
                  aria-label="Eliminar categoría"
                >
                  <TrashIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </main>
  );
}

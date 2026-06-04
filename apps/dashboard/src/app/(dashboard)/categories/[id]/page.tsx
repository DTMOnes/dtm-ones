// Next
import { notFound } from "next/navigation";

// Components
import CategoryPlayers from "@/components/categories/category-players";
import DeleteCategoryCard from "@/components/categories/delete-category-card";
import EditCategoryForm from "@/components/categories/edit-category-form";

// Db + Drizzle
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: {
      playerCategories: {
        with: {
          player: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const players = category.playerCategories.map(
    (playerCategory) => playerCategory.player,
  );

  return (
    <main className="p-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-sm text-muted-foreground">Category profile</p>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-6">
        <EditCategoryForm category={{ id: category.id, name: category.name }} />
        <CategoryPlayers categoryId={category.id} players={players} />
        <DeleteCategoryCard
          categoryId={category.id}
          categoryName={category.name}
          playerCount={category.playerCategories.length}
        />
      </div>
    </main>
  );
}

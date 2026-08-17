import { notFound } from "next/navigation";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { schema } from "@dtm/database";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

import { CategoryPlayers } from "@/components/categories/category-players";
import { DeleteCategoryCard } from "@/components/categories/delete-category-card";
import { RenameCategoryForm } from "@/components/categories/rename-category-form";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [[category], players] = await Promise.all([
    db
      .select({
        id: schema.categories.id,
        name: schema.categories.name,
      })
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1),
    db
      .select({
        id: schema.clients.id,
        name: schema.clients.name,
        lastClub: schema.clients.lastClub,
      })
      .from(schema.clients)
      .where(
        and(
          eq(schema.clients.categoryId, id),
          eq(schema.clients.kind, "player"),
        ),
      )
      .orderBy(asc(schema.clients.name)),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <main className="flex h-full w-full flex-col gap-8 p-10">
      <div className="flex flex-col gap-4">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/categories">
            <ArrowLeftIcon />
            Categories
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground text-sm">Category profile</p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <RenameCategoryForm
          categoryId={category.id}
          currentName={category.name}
        />
        <CategoryPlayers players={players} />
        <DeleteCategoryCard
          categoryId={category.id}
          categoryName={category.name}
          playerCount={players.length}
        />
      </div>
    </main>
  );
}

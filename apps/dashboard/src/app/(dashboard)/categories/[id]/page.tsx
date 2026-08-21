import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { schema } from "@dtm/database";

import { CategoryPlayers } from "@/components/categories/category-players";
import { DeleteCategoryCard } from "@/components/categories/delete-category-card";
import { RenameCategoryForm } from "@/components/categories/rename-category-form";
import {
  DetailLayout,
  PageHeader,
  PageShell,
} from "@/components/page/page-frame";
import { db } from "@/lib/db";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await db.query.categories.findFirst({
    columns: {
      id: true,
      name: true,
    },
    where: eq(schema.categories.id, id),
    with: {
      players: {
        columns: {
          id: true,
          name: true,
          lastClub: true,
        },
        where: eq(schema.clients.kind, "player"),
        orderBy: [asc(schema.clients.name)],
      },
    },
  });

  if (!category) {
    notFound();
  }

  const players = category.players;

  return (
    <PageShell>
      <PageHeader
        backHref="/categories"
        backLabel="Categories"
        title={category.name}
        description="Category profile"
      />

      <DetailLayout
        main={
          <>
            <RenameCategoryForm
              categoryId={category.id}
              currentName={category.name}
            />
            <CategoryPlayers players={players} />
          </>
        }
        rail={
          <DeleteCategoryCard
            categoryId={category.id}
            categoryName={category.name}
            playerCount={players.length}
          />
        }
      />
    </PageShell>
  );
}

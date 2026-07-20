import { Suspense } from "react";

import CategoriesListView from "@/components/categories/categories-list-view";
import { Spinner } from "@/components/ui/spinner";
import { listCategories } from "@/lib/categories/queries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const categories = await listCategories(q);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <CategoriesListView categories={categories} />
    </Suspense>
  );
}

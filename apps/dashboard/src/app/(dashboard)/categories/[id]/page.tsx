// Next
import { notFound } from "next/navigation";

// Components
import CategoryDetailView from "@/components/categories/category-detail-view";

// Lib
import { ApiError } from "@/lib/api/errors";
import { getCategoryByIdServer } from "@/lib/api/server-queries";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await getCategoryByIdServer(id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  });

  return <CategoryDetailView category={category} />;
}

import { notFound } from "next/navigation";

import CategoryDetailView from "@/components/categories/category-detail-view";
import { getCategoryById } from "@/lib/categories/queries";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return <CategoryDetailView category={category} />;
}

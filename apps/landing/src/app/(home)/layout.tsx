import { listPublicRosterCategories } from "@/lib/roster/queries";

import HomeCategoryFilters from "@/components/Home/CategoryFilters";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await listPublicRosterCategories();

  return (
    <>
      <HomeCategoryFilters categories={categories} />
      {children}
    </>
  );
}

import { listPublicRosterCategories, listPublicRosterPlayers } from "@/lib/roster/queries";
import { COACHES_FILTER_ID } from "@/lib/roster/constants";

import HomeCategoryFilters from "@/components/Home/CategoryFilters";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, coaches] = await Promise.all([
    listPublicRosterCategories(),
    listPublicRosterPlayers({ kind: "coach", limit: 1 }),
  ]);

  const filters = [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    ...(coaches.clients.length > 0
      ? [{ id: COACHES_FILTER_ID, name: "Coaches" }]
      : []),
  ];

  return (
    <>
      <HomeCategoryFilters categories={filters} />
      {children}
    </>
  );
}

// Queries
import { listPublicRosterCategories } from "@/lib/roster/queries";

// Components
import Header from "@/components/Header";
import Search from "@/components/Header/Search";
import Filters from "@/components/Header/Filters";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await listPublicRosterCategories();

  return (
    <>
      <Header
        search={<Search />}
        filters={<Filters items={categories} />}
      />
      {children}
    </>
  );
}

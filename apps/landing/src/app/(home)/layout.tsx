// Queries
import { listPublicRosterCategories } from "@/lib/roster/queries";

// Components
import Controls from "@/components/Controls";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await listPublicRosterCategories();

  return (
    <>
      {children}
      <Controls categories={categories} />
    </>
  );
}

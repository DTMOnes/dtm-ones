// Queries
import { listPublicRosterCategories } from "@/lib/roster/queries";

// Components
import Controls from "@/components/Controls";
import { ViewModeProvider } from "@/components/ViewModeProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await listPublicRosterCategories();

  return (
    <ViewModeProvider>
      {children}
      <Controls categories={categories} />
    </ViewModeProvider>
  );
}

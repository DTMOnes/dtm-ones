// Utils
import { requireAdmin } from "@/utils/require-admin";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return children;
}

import { notFound } from "next/navigation";

import { UserDetailView } from "@/components/users/user-detail-view";
import { getUserById } from "@/lib/users/queries";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return <UserDetailView user={user} />;
}

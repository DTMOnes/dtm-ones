// Next
import { notFound } from "next/navigation";

// Components
import UserDetailView from "@/components/users/user-detail-view";

// Lib
import { ApiError } from "@/lib/api/errors";
import { getUserByIdServer } from "@/lib/api/server-queries";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUserByIdServer(id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  });

  return <UserDetailView user={user} />;
}

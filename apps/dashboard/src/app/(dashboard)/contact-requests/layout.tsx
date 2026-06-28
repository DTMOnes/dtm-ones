// Next
import { redirect } from "next/navigation";

// Lib
import { serverApiFetch } from "@/lib/api/server-client";
import type { ApiAuthSessionUser } from "@/lib/api/types";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: ApiAuthSessionUser;
  try {
    user = await serverApiFetch<ApiAuthSessionUser>("/auth/me");
  } catch {
    redirect("/auth/signin");
  }

  if (user.role !== "admin") {
    redirect("/players");
  }

  return children;
}

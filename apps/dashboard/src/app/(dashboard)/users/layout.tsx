import { redirect } from "next/navigation";

import { getSession } from "@/utils/auth/get-session";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session.status !== "authenticated" || session.user.role !== "owner") {
    redirect("/contacts");
  }

  return children;
}

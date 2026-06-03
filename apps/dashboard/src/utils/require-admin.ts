// Next
import { redirect } from "next/navigation";

// Utils
import { getSession } from "@/utils/get-session";

export async function requireAdmin() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/players");
  }

  return session;
}

export async function assertAdmin() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized.");
  }

  if (session.user.role !== "admin") {
    throw new Error("You do not have administrator permissions.");
  }

  return session;
}

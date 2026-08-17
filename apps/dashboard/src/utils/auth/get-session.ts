import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import type { Session } from "@/types/auth/session";
import { findDashboardUser } from "@/utils/auth/find-dashboard-user";

export async function getSession(): Promise<Session | null> {
  const baSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!baSession?.user?.email) {
    return null;
  }

  try {
    const user = await findDashboardUser(baSession.user.id);
    if (!user) {
      return null;
    }

    return {
      status: "authenticated",
      user,
    };
  } catch (error) {
    console.error("[get-session]", error);
    return null;
  }
}

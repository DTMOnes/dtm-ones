import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import type { Session } from "@/types/auth/session";

export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const { user } = session;
  
  if (user.role !== "owner" && user.role !== "staff") {
    return null;
  }

  return {
    status: "authenticated",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import type { Session } from "@/types/auth/session";
import { userFromBetterAuth } from "@/utils/auth/user-from-better-auth";

export async function getSession(): Promise<Session | null> {
  const baSession = await auth.api.getSession({
    headers: await headers(),
  });

  const user = userFromBetterAuth(baSession?.user);
  if (!user) {
    return null;
  }

  return {
    status: "authenticated",
    user,
  };
}

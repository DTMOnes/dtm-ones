import { headers } from "next/headers";

import {
  FORBIDDEN,
  PLEASE_SIGN_IN,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { auth } from "@/lib/auth";
import type { DashboardRole } from "@/lib/auth/types";
import { findDashboardUser } from "@/utils/auth/find-dashboard-user";

export type StaffUser = {
  id: string;
  email: string;
  role: DashboardRole;
};

export async function requireStaff(): Promise<
  ActionResult<{ user: StaffUser }>
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { data: null, error: { message: PLEASE_SIGN_IN } };
  }

  if (!session.user.email) {
    return { data: null, error: { message: FORBIDDEN } };
  }

  try {
    const user = await findDashboardUser(session.user.id);
    if (!user) {
      return { data: null, error: { message: FORBIDDEN } };
    }

    return { data: { user }, error: null };
  } catch (error) {
    console.error("[requireStaff]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }
}

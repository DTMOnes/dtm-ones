import {
  FORBIDDEN,
  PLEASE_SIGN_IN,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import type { DashboardRole } from "@/lib/auth/types";
import { auth } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import { headers } from "next/headers";

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

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("users")
    .select("id, email, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("[requireStaff]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!data) {
    return { data: null, error: { message: FORBIDDEN } };
  }

  if (data.role !== "owner" && data.role !== "staff") {
    return { data: null, error: { message: FORBIDDEN } };
  }

  return {
    data: {
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
      },
    },
    error: null,
  };
}

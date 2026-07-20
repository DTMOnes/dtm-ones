import {
  FORBIDDEN,
  PLEASE_SIGN_IN,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";

export type StaffUser = {
  id: string;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function requireStaff(): Promise<
  ActionResult<{ user: StaffUser }>
> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error) {
    console.error("[requireStaff]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const user = data.user;
  if (!user) {
    return { data: null, error: { message: PLEASE_SIGN_IN } };
  }

  const role = user.metadata?.role;
  if (role !== "owner" && role !== "staff") {
    return { data: null, error: { message: FORBIDDEN } };
  }

  return { data: { user }, error: null };
}

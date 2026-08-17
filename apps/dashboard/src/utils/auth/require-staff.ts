import type { DashboardRole } from "@/lib/auth/types";
import { getSession } from "@/utils/auth/get-session";

export type StaffUser = {
  id: string;
  email: string;
  role: DashboardRole;
};

export type StaffGate<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string } };

export async function requireStaff(): Promise<StaffGate<{ user: StaffUser }>> {
  const session = await getSession();
  if (!session) {
    return { data: null, error: { message: "You need to sign in again." } };
  }

  return { data: { user: session.user }, error: null };
}

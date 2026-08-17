import { FORBIDDEN, type ActionResult } from "@/lib/action-result";
import {
  requireStaff,
  type StaffUser,
} from "@/utils/auth/require-staff";

export async function requireOwner(): Promise<
  ActionResult<{ user: StaffUser }>
> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  if (gate.data.user.role !== "owner") {
    return { data: null, error: { message: FORBIDDEN } };
  }

  return gate;
}

import { requireStaff, type StaffGate, type StaffUser } from "@/utils/auth/require-staff";

export async function requireOwner(): Promise<StaffGate<{ user: StaffUser }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  if (gate.data.user.role !== "owner") {
    return { data: null, error: { message: "You cannot do this." } };
  }

  return gate;
}

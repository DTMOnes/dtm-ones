import { z } from "zod";

import { createInsforgeServer } from "@/lib/insforge-server";
import type { Session } from "@/types/auth/session";

const metadataRoleSchema = z.object({
  role: z.enum(["owner", "staff"]),
});

export async function getSession(): Promise<Session | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error) {
    console.error("[get-session]", error);
    return null;
  }

  const user = data.user;
  if (!user) {
    return null;
  }

  const parsed = metadataRoleSchema.safeParse(user.metadata ?? {});
  if (!parsed.success || !user.email) {
    return null;
  }

  return {
    status: "authenticated",
    user: {
      id: user.id,
      email: user.email,
      role: parsed.data.role,
    },
  };
}

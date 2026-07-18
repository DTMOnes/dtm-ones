import { z } from "zod";

import type { DashboardUser } from "@/lib/auth/types";
import { createInsforgeServer } from "@/lib/insforge-server";

const metadataRoleSchema = z.object({
  role: z.string(),
});

export type Session =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "authenticated"; user: DashboardUser };

export async function getSession(): Promise<Session> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user) {
    throw Error("Unauthenticated");
  }

  const parsed = metadataRoleSchema.safeParse(user.metadata ?? {});
  if (!parsed.success || !user.email) {
    throw Error("Forbidden");
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

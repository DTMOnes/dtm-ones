import { z } from "zod";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { Session } from "@/types/auth/session";

const roleSchema = z.enum(["owner", "staff"]);

export async function getSession(): Promise<Session | null> {
  const baSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!baSession?.user?.email) {
    return null;
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("users")
    .select("id, email, role")
    .eq("id", baSession.user.id)
    .maybeSingle();

  if (error) {
    console.error("[get-session]", error);
    return null;
  }

  if (!data) {
    return null;
  }

  const parsed = roleSchema.safeParse(data.role);
  if (!parsed.success) {
    return null;
  }

  return {
    status: "authenticated",
    user: {
      id: data.id,
      email: data.email,
      role: parsed.data,
    },
  };
}

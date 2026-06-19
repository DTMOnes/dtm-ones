// Db + Drizzle
import { db } from "@/lib/db";
import { user } from "@dtm/db/schema";
import { count, eq } from "drizzle-orm";

export async function countAdminUsers() {
  const [result] = await db
    .select({ value: count() })
    .from(user)
    .where(eq(user.role, "admin"));

  return result?.value ?? 0;
}

export function isOnlyAdmin(
  targetUser: { role: string | null },
  adminCount: number,
) {
  return targetUser.role === "admin" && adminCount === 1;
}

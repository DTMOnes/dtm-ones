import { eq } from "drizzle-orm";
import { schema } from "@dtm/database";

import type { DashboardUser } from "@/lib/auth/types";
import { db } from "@/lib/db";

export async function findDashboardUser(
  id: string,
): Promise<DashboardUser | null> {
  const [row] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  if (row.role !== "owner" && row.role !== "staff") {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
  };
}

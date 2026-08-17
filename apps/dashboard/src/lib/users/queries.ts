import { count, eq } from "drizzle-orm";
import { schema } from "@dtm/database";

import type { DashboardRole } from "@/lib/auth/types";
import { db } from "@/lib/db";
import type {
  DashboardUserDetail,
  DashboardUserRow,
} from "@/types/user";

type UserJoinRow = {
  id: string;
  email: string;
  name: string | null;
  role: DashboardRole;
  createdAt: Date;
  updatedAt: Date;
};

function mapUserRow(row: UserJoinRow): DashboardUserRow {
  return {
    id: row.id,
    email: row.email,
    name: row.name?.trim() ? row.name : "Unnamed user",
    role: row.role,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

const userColumns = {
  id: schema.users.id,
  email: schema.users.email,
  name: schema.user.name,
  role: schema.users.role,
  createdAt: schema.users.createdAt,
  updatedAt: schema.users.updatedAt,
};

export async function listUsers(): Promise<DashboardUserRow[]> {
  try {
    const rows = await db
      .select(userColumns)
      .from(schema.users)
      .leftJoin(schema.user, eq(schema.user.id, schema.users.id))
      .orderBy(schema.users.createdAt);

    return rows.map(mapUserRow);
  } catch (error) {
    console.error("[users/queries/list]", error);
    throw new Error("Failed to load users");
  }
}

export async function getUserById(
  id: string,
): Promise<DashboardUserDetail | null> {
  try {
    const [row] = await db
      .select(userColumns)
      .from(schema.users)
      .leftJoin(schema.user, eq(schema.user.id, schema.users.id))
      .where(eq(schema.users.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    const [ownerCountRow] = await db
      .select({ value: count() })
      .from(schema.users)
      .where(eq(schema.users.role, "owner"));

    const ownerCount = Number(ownerCountRow?.value ?? 0);
    const mapped = mapUserRow(row);

    return {
      ...mapped,
      owner_count: ownerCount,
      is_only_owner: mapped.role === "owner" && ownerCount === 1,
    };
  } catch (error) {
    console.error("[users/queries/getById]", error);
    throw new Error("Failed to load user");
  }
}

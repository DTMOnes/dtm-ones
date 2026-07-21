import type { DashboardRole } from "@/lib/auth/types";
import { getUsersDb } from "@/lib/users/pool";
import type {
  DashboardUserDetail,
  DashboardUserRow,
} from "@/types/user";

type UserJoinRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: Date | string;
  updated_at: Date | string;
  owner_count: number | string;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function parseRole(role: string): DashboardRole | null {
  if (role === "owner" || role === "staff") {
    return role;
  }
  return null;
}

function mapUserRow(row: UserJoinRow): DashboardUserRow | null {
  const role = parseRole(row.role);
  if (!role) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name?.trim() ? row.name : "Unnamed user",
    role,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

export async function listUsers(): Promise<DashboardUserRow[]> {
  const db = getUsersDb();
  try {
    const result = await db.query<UserJoinRow>(`
      SELECT
        u.id,
        u.email,
        ba.name,
        u.role,
        u.created_at,
        u.updated_at,
        (SELECT count(*)::int FROM public.users WHERE role = 'owner') AS owner_count
      FROM public.users u
      LEFT JOIN better_auth."user" ba ON ba.id = u.id
      ORDER BY u.created_at ASC
    `);

    return result.rows
      .map((row) => mapUserRow(row))
      .filter((row): row is DashboardUserRow => row !== null);
  } catch (error) {
    console.error("[users/queries/list]", error);
    throw new Error("Failed to load users");
  }
}

export async function getUserById(
  id: string,
): Promise<DashboardUserDetail | null> {
  const db = getUsersDb();
  try {
    const result = await db.query<UserJoinRow>(
      `
      SELECT
        u.id,
        u.email,
        ba.name,
        u.role,
        u.created_at,
        u.updated_at,
        (SELECT count(*)::int FROM public.users WHERE role = 'owner') AS owner_count
      FROM public.users u
      LEFT JOIN better_auth."user" ba ON ba.id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    const mapped = mapUserRow(row);
    if (!mapped) {
      return null;
    }

    const ownerCount = Number(row.owner_count);
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

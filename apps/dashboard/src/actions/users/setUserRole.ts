"use server";

import { eq, sql } from "drizzle-orm";
import { schema } from "@dtm/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { auth } from "@/lib/auth";
import type { DashboardRole } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { setUserRoleSchema } from "@/lib/validation/users";
import type { DashboardUserRow } from "@/types/user";
import { requireOwner } from "@/utils/auth/require-owner";
import { toPluginRole } from "@/utils/auth/roles";

const LAST_OWNER =
  "You cannot demote the last owner. Promote another user first.";
const SELF_DEMOTE = "You cannot demote your own account.";

type UserRoleRow = {
  id: string;
  email: string;
  role: DashboardRole;
  created_at: Date;
  updated_at: Date;
  name: string | null;
};

function toUserRow(row: UserRoleRow): DashboardUserRow {
  return {
    id: row.id,
    email: row.email,
    name: row.name?.trim() ? row.name : "Unnamed user",
    role: row.role,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export async function setUserRoleAction(input: {
  userId: string;
  role: DashboardRole;
}): Promise<ActionResult<{ user: DashboardUserRow }>> {
  const gate = await requireOwner();
  if (gate.error) {
    return gate;
  }

  const parsed = setUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          parsed.error.issues[0]?.message ??
          "The role change could not be validated. Please try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { userId, role } = parsed.data;
  const actingOwnerId = gate.data.user.id;

  let previousRole: DashboardRole | null = null;

  try {
    const [currentRow] = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        name: schema.user.name,
      })
      .from(schema.users)
      .leftJoin(schema.user, eq(schema.user.id, schema.users.id))
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!currentRow) {
      return { data: null, error: { message: NOT_FOUND } };
    }

    previousRole = currentRow.role;

    if (previousRole === role) {
      return {
        data: {
          user: {
            id: currentRow.id,
            email: currentRow.email,
            name: currentRow.name?.trim()
              ? currentRow.name
              : "Unnamed user",
            role: currentRow.role,
            created_at: currentRow.createdAt.toISOString(),
            updated_at: currentRow.updatedAt.toISOString(),
          },
        },
        error: null,
      };
    }

    // Conditional update enforces self demote and last owner in one statement.
    const updated = await db.execute<UserRoleRow>(sql`
      UPDATE public.users AS u
      SET role = ${role}, updated_at = now()
      FROM better_auth."user" ba
      WHERE u.id = ${userId}
        AND ba.id = u.id
        AND NOT (u.id = ${actingOwnerId} AND u.role = 'owner' AND ${role} = 'staff')
        AND NOT (
          u.role = 'owner'
          AND ${role} = 'staff'
          AND (SELECT count(*) FROM public.users WHERE role = 'owner') = 1
        )
      RETURNING u.id, u.email, u.role, u.created_at, u.updated_at, ba.name
    `);

    const row = updated.rows[0];
    if (!row) {
      if (
        userId === actingOwnerId &&
        previousRole === "owner" &&
        role === "staff"
      ) {
        return { data: null, error: { message: SELF_DEMOTE } };
      }
      if (previousRole === "owner" && role === "staff") {
        return { data: null, error: { message: LAST_OWNER } };
      }
      return { data: null, error: { message: NOT_FOUND } };
    }

    try {
      await auth.api.setRole({
        headers: await headers(),
        body: {
          userId,
          role: toPluginRole(role),
        },
      });
    } catch (setRoleError) {
      console.error("[setUserRole] Better Auth setRole failed", setRoleError);

      try {
        await db
          .update(schema.users)
          .set({ role: previousRole, updatedAt: new Date() })
          .where(eq(schema.users.id, userId));
      } catch (rollbackError) {
        console.error(
          "[setUserRole] rollback failed; reconcile public.users.role manually",
          {
            userId,
            previousRole,
            attemptedRole: role,
            error: rollbackError,
          },
        );
      }

      return { data: null, error: { message: UNAVAILABLE } };
    }

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);
    return {
      data: { user: toUserRow(row) },
      error: null,
    };
  } catch (error) {
    console.error("[setUserRole]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }
}

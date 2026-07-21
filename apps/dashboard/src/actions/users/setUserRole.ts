"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { auth } from "@/lib/auth";
import type { DashboardRole } from "@/lib/auth/types";
import { requireOwner } from "@/lib/require-owner";
import { getUsersDb } from "@/lib/users/pool";
import { toPluginRole } from "@/lib/users/roles";
import { setUserRoleSchema } from "@/lib/validation/users";
import type { DashboardUserRow } from "@/types/user";

const LAST_OWNER =
  "You cannot demote the last owner. Promote another user first.";
const SELF_DEMOTE = "You cannot demote your own account.";

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
  const db = getUsersDb();

  let previousRole: DashboardRole | null = null;

  try {
    const current = await db.query<{
      id: string;
      email: string;
      role: DashboardRole;
      created_at: Date;
      updated_at: Date;
      name: string | null;
    }>(
      `
      SELECT
        u.id,
        u.email,
        u.role,
        u.created_at,
        u.updated_at,
        ba.name
      FROM public.users u
      LEFT JOIN better_auth."user" ba ON ba.id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
      [userId],
    );

    const currentRow = current.rows[0];
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
            created_at: currentRow.created_at.toISOString(),
            updated_at: currentRow.updated_at.toISOString(),
          },
        },
        error: null,
      };
    }

    // Conditional update enforces self demote and last owner in one statement.
    const updated = await db.query<{
      id: string;
      email: string;
      role: DashboardRole;
      created_at: Date;
      updated_at: Date;
      name: string | null;
    }>(
      `
      UPDATE public.users AS u
      SET role = $2, updated_at = now()
      FROM better_auth."user" ba
      WHERE u.id = $1
        AND ba.id = u.id
        AND NOT (u.id = $3 AND u.role = 'owner' AND $2 = 'staff')
        AND NOT (
          u.role = 'owner'
          AND $2 = 'staff'
          AND (SELECT count(*) FROM public.users WHERE role = 'owner') = 1
        )
      RETURNING u.id, u.email, u.role, u.created_at, u.updated_at, ba.name
    `,
      [userId, role, actingOwnerId],
    );

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
        await db.query(
          `
          UPDATE public.users
          SET role = $2, updated_at = now()
          WHERE id = $1
        `,
          [userId, previousRole],
        );
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
      data: {
        user: {
          id: row.id,
          email: row.email,
          name: row.name?.trim() ? row.name : "Unnamed user",
          role: row.role,
          created_at: row.created_at.toISOString(),
          updated_at: row.updated_at.toISOString(),
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("[setUserRole]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }
}

"use server";

import { eq } from "drizzle-orm";
import { schema } from "@dtm/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import type { DashboardRole } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { setUserRoleSchema } from "@/lib/validation/users";
import type { DashboardUserRow } from "@/types/user";
import { requireOwner } from "@/utils/auth/require-owner";
import { isDashboardRole } from "@/utils/auth/user-from-better-auth";

type ActionResult<T> =
  | { data: T; error: null }
  | {
      data: null;
      error: { message: string; fieldErrors?: Record<string, string[]> };
    };

const LAST_OWNER =
  "You cannot demote the last owner. Promote another user first.";
const SELF_DEMOTE = "You cannot demote your own account.";
const NOT_FOUND = "Resource could not be found.";
const UNAVAILABLE =
  "This service is temporarily unavailable. Please try again in a moment.";

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

  try {
    const [currentRow] = await db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        role: schema.user.role,
        createdAt: schema.user.createdAt,
        updatedAt: schema.user.updatedAt,
        name: schema.user.name,
      })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!currentRow || !isDashboardRole(currentRow.role)) {
      return { data: null, error: { message: NOT_FOUND } };
    }

    const previousRole = currentRow.role;

    if (previousRole === role) {
      return {
        data: {
          user: {
            id: currentRow.id,
            email: currentRow.email,
            name: currentRow.name?.trim() ? currentRow.name : "Unnamed user",
            role: previousRole,
            created_at: currentRow.createdAt.toISOString(),
            updated_at: currentRow.updatedAt.toISOString(),
          },
        },
        error: null,
      };
    }

    if (userId === actingOwnerId && previousRole === "owner" && role === "staff") {
      return { data: null, error: { message: SELF_DEMOTE } };
    }

    if (previousRole === "owner" && role === "staff") {
      const owners = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.role, "owner"));

      if (owners.length === 1) {
        return { data: null, error: { message: LAST_OWNER } };
      }
    }

    await auth.api.setRole({
      headers: await headers(),
      body: {
        userId,
        role,
      },
    });

    const [updated] = await db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        role: schema.user.role,
        createdAt: schema.user.createdAt,
        updatedAt: schema.user.updatedAt,
        name: schema.user.name,
      })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!updated || !isDashboardRole(updated.role)) {
      return { data: null, error: { message: UNAVAILABLE } };
    }

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);
    return {
      data: {
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name?.trim() ? updated.name : "Unnamed user",
          role: updated.role,
          created_at: updated.createdAt.toISOString(),
          updated_at: updated.updatedAt.toISOString(),
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("[setUserRole]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }
}

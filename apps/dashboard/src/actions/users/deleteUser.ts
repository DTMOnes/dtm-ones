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
import { db } from "@/lib/db";
import { deleteUserSchema } from "@/lib/validation/users";
import { requireOwner } from "@/utils/auth/require-owner";

const LAST_OWNER =
  "You cannot delete the last owner. Promote another user first.";
const SELF_DELETE = "You cannot delete your own account.";

export async function deleteUserAction(input: {
  id: string;
}): Promise<ActionResult<{ ok: true }>> {
  const gate = await requireOwner();
  if (gate.error) {
    return gate;
  }

  const parsed = deleteUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          parsed.error.issues[0]?.message ??
          "The user could not be validated. Please try again.",
      },
    };
  }

  const { id } = parsed.data;
  const actingOwnerId = gate.data.user.id;

  try {
    const [existingRow] = await db
      .select({ role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (!existingRow) {
      return { data: null, error: { message: NOT_FOUND } };
    }

    // Conditional delete enforces self delete and last owner in one statement.
    const deleted = await db.execute<{ id: string }>(sql`
      DELETE FROM public.users AS u
      WHERE u.id = ${id}
        AND u.id <> ${actingOwnerId}
        AND NOT (
          u.role = 'owner'
          AND (SELECT count(*) FROM public.users WHERE role = 'owner') = 1
        )
      RETURNING u.id
    `);

    if (!deleted.rows[0]) {
      if (id === actingOwnerId) {
        return { data: null, error: { message: SELF_DELETE } };
      }
      if (existingRow.role === "owner") {
        return { data: null, error: { message: LAST_OWNER } };
      }
      return { data: null, error: { message: NOT_FOUND } };
    }

    try {
      await auth.api.removeUser({
        headers: await headers(),
        body: { userId: id },
      });
    } catch (removeError) {
      // App role row is gone, so gates deny sign in. Log for manual cleanup.
      console.error(
        "[deleteUser] Better Auth removeUser failed after public.users delete; cleanup identity manually",
        {
          userId: id,
          error: removeError,
        },
      );
    }

    revalidatePath("/users");
    return { data: { ok: true }, error: null };
  } catch (error) {
    console.error("[deleteUser]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }
}

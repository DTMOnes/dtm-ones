"use server";

import { eq } from "drizzle-orm";
import { schema } from "@dtm/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteUserSchema } from "@/lib/validation/users";
import { requireOwner } from "@/utils/auth/require-owner";

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string } };

const LAST_OWNER =
  "You cannot delete the last owner. Promote another user first.";
const SELF_DELETE = "You cannot delete your own account.";
const NOT_FOUND = "Resource could not be found.";
const UNAVAILABLE =
  "This service is temporarily unavailable. Please try again in a moment.";

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
      .select({ role: schema.user.role })
      .from(schema.user)
      .where(eq(schema.user.id, id))
      .limit(1);

    if (!existingRow) {
      return { data: null, error: { message: NOT_FOUND } };
    }

    if (id === actingOwnerId) {
      return { data: null, error: { message: SELF_DELETE } };
    }

    if (existingRow.role === "owner") {
      const owners = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.role, "owner"));

      if (owners.length === 1) {
        return { data: null, error: { message: LAST_OWNER } };
      }
    }

    await auth.api.removeUser({
      headers: await headers(),
      body: { userId: id },
    });

    revalidatePath("/users");
    return { data: { ok: true }, error: null };
  } catch (error) {
    console.error("[deleteUser]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }
}

"use server";

import { schema } from "@dtm/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { auth } from "@/lib/auth";
import type { DashboardRole } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { createUserSchema } from "@/lib/validation/users";
import type { DashboardUserRow } from "@/types/user";
import {
  getBetterAuthErrorMessage,
  isDuplicateEmailError,
} from "@/utils/auth/better-auth-error";
import { requireOwner } from "@/utils/auth/require-owner";
import { toPluginRole } from "@/utils/auth/roles";

const EMAIL_TAKEN = "An account with this email already exists.";

export async function createUserAction(input: {
  name: string;
  email: string;
  password: string;
  role: DashboardRole;
}): Promise<ActionResult<{ user: DashboardUserRow }>> {
  const gate = await requireOwner();
  if (gate.error) {
    return gate;
  }

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          parsed.error.issues[0]?.message ??
          "The user could not be validated. Please try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { name, email, password, role } = parsed.data;
  const requestHeaders = await headers();

  let createdUserId: string | null = null;

  try {
    const created = await auth.api.createUser({
      headers: requestHeaders,
      body: {
        name,
        email,
        password,
        role: toPluginRole(role),
      },
    });

    createdUserId = created.user.id;

    const [row] = await db
      .insert(schema.users)
      .values({
        id: created.user.id,
        email: email.toLowerCase(),
        role,
      })
      .returning();

    if (!row) {
      throw new Error("public.users insert returned no row");
    }

    revalidatePath("/users");
    return {
      data: {
        user: {
          id: row.id,
          email: row.email,
          name: created.user.name?.trim() ? created.user.name : name,
          role: row.role,
          created_at: row.createdAt.toISOString(),
          updated_at: row.updatedAt.toISOString(),
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("[createUser]", error);

    if (createdUserId) {
      try {
        await auth.api.removeUser({
          headers: requestHeaders,
          body: { userId: createdUserId },
        });
      } catch (compensationError) {
        console.error(
          "[createUser] compensation removeUser failed; manual cleanup required",
          {
            userId: createdUserId,
            error: compensationError,
          },
        );
      }
    }

    if (isDuplicateEmailError(error)) {
      return {
        data: null,
        error: {
          message: EMAIL_TAKEN,
          fieldErrors: { email: [EMAIL_TAKEN] },
        },
      };
    }

    const message = getBetterAuthErrorMessage(error);
    if (/unique|duplicate|users_email/i.test(message)) {
      return {
        data: null,
        error: {
          message: EMAIL_TAKEN,
          fieldErrors: { email: [EMAIL_TAKEN] },
        },
      };
    }

    return { data: null, error: { message: UNAVAILABLE } };
  }
}

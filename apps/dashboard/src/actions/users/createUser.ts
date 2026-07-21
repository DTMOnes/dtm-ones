"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { auth } from "@/lib/auth";
import type { DashboardRole } from "@/lib/auth/types";
import { requireOwner } from "@/lib/require-owner";
import {
  getBetterAuthErrorMessage,
  isDuplicateEmailError,
} from "@/lib/users/better-auth-error";
import { getUsersDb } from "@/lib/users/pool";
import { toPluginRole } from "@/lib/users/roles";
import { createUserSchema } from "@/lib/validation/users";
import type { DashboardUserRow } from "@/types/user";

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

    const db = getUsersDb();
    const inserted = await db.query<{
      id: string;
      email: string;
      role: DashboardRole;
      created_at: Date;
      updated_at: Date;
    }>(
      `
      INSERT INTO public.users (id, email, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at, updated_at
    `,
      [created.user.id, email.toLowerCase(), role],
    );

    const row = inserted.rows[0];
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
          created_at: row.created_at.toISOString(),
          updated_at: row.updated_at.toISOString(),
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

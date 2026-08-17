"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import type { DashboardRole } from "@/lib/auth/types";
import { createUserSchema } from "@/lib/validation/users";
import type { DashboardUserRow } from "@/types/user";
import {
  getBetterAuthErrorMessage,
  isDuplicateEmailError,
} from "@/utils/auth/better-auth-error";
import { requireOwner } from "@/utils/auth/require-owner";

type ActionResult<T> =
  | { data: T; error: null }
  | {
      data: null;
      error: { message: string; fieldErrors?: Record<string, string[]> };
    };

const EMAIL_TAKEN = "An account with this email already exists.";
const UNAVAILABLE =
  "This service is temporarily unavailable. Please try again in a moment.";

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

  try {
    const created = await auth.api.createUser({
      headers: requestHeaders,
      body: {
        name,
        email,
        password,
        role,
      },
    });

    const now = new Date().toISOString();

    revalidatePath("/users");
    return {
      data: {
        user: {
          id: created.user.id,
          email: created.user.email,
          name: created.user.name?.trim() ? created.user.name : name,
          role,
          created_at: created.user.createdAt
            ? new Date(created.user.createdAt).toISOString()
            : now,
          updated_at: created.user.updatedAt
            ? new Date(created.user.updatedAt).toISOString()
            : now,
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("[createUser]", error);

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

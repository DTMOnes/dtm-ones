"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { z } from "zod";

import {
  INVALID_CREDENTIALS,
  NOT_AUTHORIZED,
  type ActionResult,
} from "@/lib/action-result";
import { auth } from "@/lib/auth";
import type { SignInSuccess, SignOutSuccess } from "@/lib/auth/types";
import { createInsforgeServerWithUserId } from "@/lib/insforge-server";
import { signInSchema } from "@/lib/validation/auth";

const SIGN_IN_UNAVAILABLE_MESSAGE =
  "Sign in is temporarily unavailable. Please try again in a moment.";

const SIGN_OUT_UNAVAILABLE_MESSAGE =
  "Sign out could not be confirmed. Please sign in again if needed.";

const roleSchema = z.enum(["owner", "staff"]);

async function cleanupSignInSession(): Promise<void> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (cleanupError) {
    console.error("[signIn]", cleanupError);
  }
}

export async function signInAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult<SignInSuccess>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          "Sign in could not be validated. Please check your details and try again.",
      },
    };
  }

  try {
    const signedIn = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });

    const authUser = signedIn.user;
    if (!authUser?.id || !authUser.email) {
      console.error("[signIn]", "Better Auth sign in returned no user");
      return {
        data: null,
        error: { message: SIGN_IN_UNAVAILABLE_MESSAGE },
      };
    }

    // Use the signed-in user id directly. Do not wait for cookie round trip.
    const insforge = createInsforgeServerWithUserId(authUser.id);
    const { data, error } = await insforge.database
      .from("users")
      .select("id, email, role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("[signIn]", error);
      await cleanupSignInSession();
      return {
        data: null,
        error: { message: SIGN_IN_UNAVAILABLE_MESSAGE },
      };
    }

    const role = roleSchema.safeParse(data?.role);
    if (!data || !role.success) {
      await cleanupSignInSession();
      return {
        data: null,
        error: { message: NOT_AUTHORIZED },
      };
    }

    return {
      data: {
        ok: true,
        user: {
          id: data.id,
          email: data.email,
          role: role.data,
        },
      },
      error: null,
    };
  } catch (error) {
    if (error instanceof APIError) {
      const status = error.statusCode ?? error.status;
      if (status === 401 || status === 403) {
        return {
          data: null,
          error: { message: INVALID_CREDENTIALS },
        };
      }
    }

    console.error("[signIn]", error);
    return {
      data: null,
      error: { message: SIGN_IN_UNAVAILABLE_MESSAGE },
    };
  }
}

export async function signOutAction(): Promise<ActionResult<SignOutSuccess>> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("[signOut]", error);
    return {
      data: null,
      error: { message: SIGN_OUT_UNAVAILABLE_MESSAGE },
    };
  }

  return { data: { ok: true }, error: null };
}

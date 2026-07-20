"use server";

import {
  INVALID_CREDENTIALS,
  type ActionResult,
} from "@/lib/action-result";
import type { SignInSuccess, SignOutSuccess } from "@/lib/auth/types";
import { createInsforgeAuthActions } from "@/lib/insforge-server";
import { signInSchema } from "@/lib/validation/auth";
import { getSession } from "@/utils/auth/get-session";

const SIGN_IN_UNAVAILABLE_MESSAGE =
  "Sign in is temporarily unavailable. Please try again in a moment.";

const SIGN_OUT_UNAVAILABLE_MESSAGE =
  "Sign out could not be confirmed. Please sign in again if needed.";

const NOT_AUTHORIZED_MESSAGE =
  "This account is not authorized to access the dashboard.";

function isInvalidCredentials(error: {
  statusCode?: number;
  error?: string;
}): boolean {
  return (
    error.statusCode === 401 ||
    error.error === "INVALID_CREDENTIALS" ||
    error.error === "UNAUTHORIZED"
  );
}

type SignOutCapable = {
  signOut: () => Promise<{ error: unknown }>;
};

async function cleanupSignInSession(auth: SignOutCapable): Promise<void> {
  try {
    const { error } = await auth.signOut();
    if (error) {
      console.error("[signIn]", error);
    }
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

  const auth = await createInsforgeAuthActions();

  const { data, error } = await auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (isInvalidCredentials(error)) {
      return {
        data: null,
        error: { message: INVALID_CREDENTIALS },
      };
    }

    console.error("[signIn]", error);
    return {
      data: null,
      error: { message: SIGN_IN_UNAVAILABLE_MESSAGE },
    };
  }

  const authUser = data?.user;
  if (!authUser) {
    console.error("[signIn]", "InsForge sign in returned no user");
    return {
      data: null,
      error: { message: SIGN_IN_UNAVAILABLE_MESSAGE },
    };
  }

  const session = await getSession();
  if (!session) {
    await cleanupSignInSession(auth);
    return {
      data: null,
      error: { message: NOT_AUTHORIZED_MESSAGE },
    };
  }

  return { data: { ok: true, user: session.user }, error: null };
}

export async function signOutAction(): Promise<ActionResult<SignOutSuccess>> {
  const auth = await createInsforgeAuthActions();
  const { error } = await auth.signOut();

  if (error) {
    console.error("[signOut]", error);
    return {
      data: null,
      error: { message: SIGN_OUT_UNAVAILABLE_MESSAGE },
    };
  }

  return { data: { ok: true }, error: null };
}

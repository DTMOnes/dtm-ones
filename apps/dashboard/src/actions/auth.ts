"use server";

import { flattenValidationErrors } from "next-safe-action";

import {
  ForbiddenActionError,
  InvalidCredentialsActionError,
  ServiceUnavailableActionError,
  normalizeCause,
  type ActionErrorContext,
} from "@/lib/action-errors";
import { actionClient } from "@/lib/safe-action";
import { createInsforgeAuthActions } from "@/lib/insforge-server";
import { signInSchema } from "@/lib/validation/auth";
import type { SignInSuccess, SignOutSuccess } from "@/lib/auth/types";
import { getSession } from "@/utils/auth/get-session";

const SIGN_IN_UNAVAILABLE_MESSAGE =
  "Sign in is temporarily unavailable. Please try again in a moment.";

function isInvalidCredentials(error: {
  statusCode: number;
  error: string;
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

async function cleanupSignInSession(
  auth: SignOutCapable,
): Promise<Error | null> {
  try {
    const { error } = await auth.signOut();
    return error ? normalizeCause(error) : null;
  } catch (error) {
    return normalizeCause(error);
  }
}

function combineWithCleanup(
  primary: Error | undefined,
  cleanup: Error | null,
): Error | undefined {
  if (!cleanup) {
    return primary;
  }
  return new AggregateError(
    primary ? [primary, cleanup] : [cleanup],
    "Sign in cleanup failed after the primary failure",
  );
}

export const signInAction = actionClient
  .metadata({ actionName: "signIn" })
  .inputSchema(signInSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }): Promise<SignInSuccess> => {
    const context: ActionErrorContext = { actionName: "signIn" };
    const auth = await createInsforgeAuthActions();

    const { data, error } = await auth.signInWithPassword({
      email: parsedInput.email,
      password: parsedInput.password,
    });

    if (error) {
      if (isInvalidCredentials(error)) {
        throw new InvalidCredentialsActionError({
          message: "Invalid email or password.",
          context,
        });
      }
      throw new ServiceUnavailableActionError({
        message: SIGN_IN_UNAVAILABLE_MESSAGE,
        context,
        cause: normalizeCause(error),
      });
    }

    const authUser = data?.user;
    if (!authUser) {
      throw new ServiceUnavailableActionError({
        message: SIGN_IN_UNAVAILABLE_MESSAGE,
        context,
        cause: new Error("InsForge sign in returned no user"),
      });
    }

    let session;
    try {
      session = await getSession();
    } catch (lookupError) {
      const cleanup = await cleanupSignInSession(auth);
      throw new ServiceUnavailableActionError({
        message: SIGN_IN_UNAVAILABLE_MESSAGE,
        context,
        cause: combineWithCleanup(normalizeCause(lookupError), cleanup),
      });
    }

    if (session.status !== "authenticated") {
      const cleanup = await cleanupSignInSession(auth);
      throw new ForbiddenActionError({
        message: "This account is not authorized to access the dashboard.",
        context,
        cause: combineWithCleanup(undefined, cleanup),
      });
    }

    return { ok: true, user: session.user };
  });

export const signOutAction = actionClient
  .metadata({ actionName: "signOut" })
  .action(async (): Promise<SignOutSuccess> => {
    const auth = await createInsforgeAuthActions();
    const { error } = await auth.signOut();

    if (error) {
      throw new ServiceUnavailableActionError({
        message:
          "Sign out could not be confirmed. Please sign in again if needed.",
        context: { actionName: "signOut" },
        cause: normalizeCause(error),
      });
    }

    return { ok: true };
  });

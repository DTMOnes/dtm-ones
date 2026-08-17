"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { signInSchema } from "@/lib/validation/auth";
import { userFromBetterAuth } from "@/utils/auth/user-from-better-auth";
import { InvalidCredentialsError } from "@/utils/errors";

export const signInAction = actionClient
  .metadata({ actionName: "signIn" })
  .inputSchema(signInSchema)
  .action(async ({ parsedInput }) => {
    try {
      const signedIn = await auth.api.signInEmail({
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
        },
        headers: await headers(),
      });

      const user = userFromBetterAuth(signedIn.user);
      if (!user) {
        try {
          await auth.api.signOut({
            headers: await headers(),
          });
        } catch (cleanupError) {
          console.error("[signIn]", cleanupError);
        }
        throw new InvalidCredentialsError();
      }

      return { ok: true as const, user };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw error;
      }

      if (error instanceof APIError) {
        const status = error.statusCode ?? error.status;
        if (status === 401 || status === 403) {
          throw new InvalidCredentialsError();
        }
      }

      throw error;
    }
  });

export const signOutAction = actionClient
  .metadata({ actionName: "signOut" })
  .action(async () => {
    await auth.api.signOut({
      headers: await headers(),
    });

    return { ok: true as const };
  });

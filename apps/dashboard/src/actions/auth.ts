"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { signInSchema } from "@/lib/validation/auth";
import { getSession } from "@/utils/auth/get-session";
import { ConflictError } from "@/utils/errors";

export const signInAction = actionClient
  .metadata({ actionName: "signIn" })
  .inputSchema(signInSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (session) {
      throw new ConflictError("Already signed in.");
    }

    const signedIn = await auth.api.signInEmail({
      body: {
        email: parsedInput.email,
        password: parsedInput.password,
      },
      headers: await headers(),
    });

    return {
      ok: true as const,
      user: {
        id: signedIn.user.id,
        email: signedIn.user.email,
        role: signedIn.user.role,
      },
    };
  });

export const signOutAction = actionClient
  .metadata({ actionName: "signOut" })
  .action(async () => {
    await auth.api.signOut({
      headers: await headers(),
    });

    return { ok: true as const };
  });

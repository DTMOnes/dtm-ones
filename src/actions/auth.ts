"use server";

// Next
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Safe Action
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Better Auth
import { auth } from "@/lib/auth/auth";

// Validation Schema
import { signInSchema } from "@/lib/validation/auth";

export const signIn = actionClient
  .metadata({ actionName: "signIn" })
  .inputSchema(signInSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput;

    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    revalidatePath("/", "layout");
    return { message: "Signed in successfully." };
  });

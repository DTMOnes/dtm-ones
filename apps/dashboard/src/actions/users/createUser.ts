"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { ownerActionClient } from "@/lib/safe-action";
import { createUserSchema } from "@/lib/validation/users";

export const createUserAction = ownerActionClient
  .metadata({ actionName: "createUser" })
  .inputSchema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const created = await auth.api.createUser({
      headers: await headers(),
      body: {
        name: parsedInput.name,
        email: parsedInput.email,
        password: parsedInput.password,
        role: parsedInput.role,
      },
    });

    revalidatePath("/users");

    return {
      ok: true as const,
      user: {
        id: created.user.id,
        email: created.user.email,
        role: created.user.role,
      },
    };
  });

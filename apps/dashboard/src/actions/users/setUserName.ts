"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { schema } from "@dtm/database";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownerActionClient } from "@/lib/safe-action";
import { setUserNameSchema } from "@/lib/validation/users";
import { NotFoundError } from "@/utils/errors";

export const setUserNameAction = ownerActionClient
  .metadata({ actionName: "setUserName" })
  .inputSchema(setUserNameSchema)
  .action(async ({ parsedInput }) => {
    const target = await db.query.user.findFirst({
      columns: { id: true },
      where: eq(schema.user.id, parsedInput.userId),
    });

    if (!target) {
      throw new NotFoundError("User");
    }

    await auth.api.adminUpdateUser({
      headers: await headers(),
      body: {
        userId: parsedInput.userId,
        data: { name: parsedInput.name },
      },
    });

    revalidatePath("/users");
    revalidatePath(`/users/${parsedInput.userId}`);

    return { ok: true as const };
  });

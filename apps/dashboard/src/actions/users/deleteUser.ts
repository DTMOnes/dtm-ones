"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { schema } from "@dtm/database";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownerActionClient } from "@/lib/safe-action";
import { deleteUserSchema } from "@/lib/validation/users";
import { NotFoundError } from "@/utils/errors";
import {
  assertCanDeleteUser,
  toDashboardRole,
} from "@/utils/auth/owner";

export const deleteUserAction = ownerActionClient
  .metadata({ actionName: "deleteUser" })
  .inputSchema(deleteUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const target = await db.query.user.findFirst({
      columns: {
        id: true,
        role: true,
      },
      where: eq(schema.user.id, parsedInput.id),
    });

    const targetRole = toDashboardRole(target?.role);
    if (!target || !targetRole) {
      throw new NotFoundError("User");
    }

    const [owners] = await db
      .select({ ownerCount: count() })
      .from(schema.user)
      .where(eq(schema.user.role, "owner"));

    assertCanDeleteUser({
      actorId: ctx.auth.user.id,
      targetId: target.id,
      targetRole,
      ownerCount: Number(owners?.ownerCount ?? 0),
    });

    await auth.api.removeUser({
      headers: await headers(),
      body: { userId: parsedInput.id },
    });

    revalidatePath("/users");

    return { ok: true as const };
  });

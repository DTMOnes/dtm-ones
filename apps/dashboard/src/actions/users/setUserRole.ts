"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { schema } from "@dtm/database";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownerActionClient } from "@/lib/safe-action";
import { setUserRoleSchema } from "@/lib/validation/users";
import { NotFoundError } from "@/utils/errors";
import {
  assertCanSetUserRole,
  toDashboardRole,
} from "@/utils/auth/owner";

export const setUserRoleAction = ownerActionClient
  .metadata({ actionName: "setUserRole" })
  .inputSchema(setUserRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const target = await db.query.user.findFirst({
      columns: {
        id: true,
        role: true,
      },
      where: eq(schema.user.id, parsedInput.userId),
    });

    const targetRole = toDashboardRole(target?.role);
    if (!target || !targetRole) {
      throw new NotFoundError("User");
    }

    const [owners] = await db
      .select({ ownerCount: count() })
      .from(schema.user)
      .where(eq(schema.user.role, "owner"));

    assertCanSetUserRole({
      actorId: ctx.auth.user.id,
      targetId: target.id,
      targetRole,
      nextRole: parsedInput.role,
      ownerCount: Number(owners?.ownerCount ?? 0),
    });

    await auth.api.setRole({
      headers: await headers(),
      body: {
        userId: parsedInput.userId,
        role: parsedInput.role,
      },
    });

    revalidatePath("/users");
    revalidatePath(`/users/${parsedInput.userId}`);

    return { ok: true as const };
  });

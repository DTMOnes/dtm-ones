"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { ownerActionClient } from "@/lib/safe-action";
import { setInstagramTokenSchema } from "@/lib/validation/settings";
import { AppError, ConflictError } from "@/utils/errors";
import {
  refreshInstagramToken,
  replaceInstagramToken,
} from "@/utils/instagram-token";

/** Owner only: save a token copied from Instagram or Vercel. The token never comes back. */
export const setInstagramTokenAction = ownerActionClient
  .metadata({ actionName: "setInstagramToken" })
  .inputSchema(setInstagramTokenSchema)
  .action(async ({ parsedInput }) => {
    await replaceInstagramToken(db, parsedInput.token);

    revalidatePath("/settings");

    return { ok: true as const };
  });

/** Owner only: renew the saved token now instead of waiting for Monday's cron. */
export const renewInstagramTokenAction = ownerActionClient
  .metadata({ actionName: "renewInstagramToken" })
  .action(async () => {
    try {
      await refreshInstagramToken(db);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error({ source: "renewInstagramToken", message: (error as Error).message });
      throw new ConflictError(
        "Instagram did not renew the token. If it expired, paste a new one below.",
      );
    }

    revalidatePath("/settings");

    return { ok: true as const };
  });

"use server";

import { z } from "zod";

import { actionClient } from "@/lib/safe-action";
import { grantPlayersAccess, isPlayersPassword } from "@/lib/roster/access";
import { AppError } from "@/utils/errors";

export const unlockPlayersAction = actionClient
  .metadata({ actionName: "unlockPlayers" })
  .inputSchema(z.object({ password: z.string().max(100) }))
  .action(async ({ parsedInput }) => {
    if (!isPlayersPassword(parsedInput.password)) {
      throw new AppError("WRONG_PASSWORD", "Incorrect password. Try again.");
    }

    await grantPlayersAccess();

    return { ok: true as const };
  });

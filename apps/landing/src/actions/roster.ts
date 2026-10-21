"use server";

import { actionClient } from "@/lib/safe-action";
import { ROSTER_PAGE_SIZE } from "@/lib/roster/constants";
import { listPublicRosterPlayers } from "@/lib/roster/queries";
import { loadRosterSchema } from "@/lib/validation/roster";
import { hasPlayersAccess } from "@/lib/roster/access";
import { AppError } from "@/utils/errors";

export const loadRosterAction = actionClient
  .metadata({ actionName: "loadRoster" })
  .inputSchema(loadRosterSchema)
  .action(async ({ parsedInput }) => {
    if (!(await hasPlayersAccess())) {
      throw new AppError("PLAYERS_LOCKED", "Enter the access password again.");
    }

    return listPublicRosterPlayers({
      q: parsedInput.q,
      categoryIds: parsedInput.categoryIds,
      kind: parsedInput.kind,
      limit: ROSTER_PAGE_SIZE,
      offset: parsedInput.offset,
    });
  });

"use server";

import { actionClient } from "@/lib/safe-action";
import { ROSTER_PAGE_SIZE } from "@/lib/roster/constants";
import { listPublicRosterPlayers } from "@/lib/roster/queries";
import { loadRosterSchema } from "@/lib/validation/roster";

export const loadRosterAction = actionClient
  .metadata({ actionName: "loadRoster" })
  .inputSchema(loadRosterSchema)
  .action(async ({ parsedInput }) => {
    return listPublicRosterPlayers({
      q: parsedInput.q,
      categoryIds: parsedInput.categoryIds,
      kind: parsedInput.kind,
      limit: ROSTER_PAGE_SIZE,
      offset: parsedInput.offset,
    });
  });

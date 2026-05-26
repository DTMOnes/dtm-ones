// Zod
import { z } from "zod";

export const playerCategorySchema = z.object({
  playerId: z.uuid(),
  categoryId: z.uuid(),
});

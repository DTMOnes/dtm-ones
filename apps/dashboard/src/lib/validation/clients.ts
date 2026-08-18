import { z } from "zod";

export const clientIdSchema = z.object({
  id: z.uuid(),
});

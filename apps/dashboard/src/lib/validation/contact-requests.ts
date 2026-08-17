import { z } from "zod";

export const contactRequestIdSchema = z.object({
  id: z.uuid(),
});

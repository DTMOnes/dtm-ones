import { z } from "zod";

export const createClientSchema = z.object({
  kind: z.enum(["player", "coach"]),
});

export const clientIdSchema = z.object({
  id: z.uuid(),
});

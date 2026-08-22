import { z } from "zod";

export const loadRosterSchema = z.object({
  q: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  categoryIds: z.array(z.uuid()).max(20).optional(),
  kind: z.literal("coach").optional(),
  offset: z.number().int().min(0).max(10_000),
});

export type LoadRosterInput = z.infer<typeof loadRosterSchema>;

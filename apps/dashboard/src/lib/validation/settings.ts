import { z } from "zod";

export const setClientsPasswordSchema = z.object({
  password: z
    .string()
    .trim()
    .min(4, "Use at least 4 characters")
    .max(100, "Use at most 100 characters"),
});

import { z } from "zod";

export const setInstagramTokenSchema = z.object({
  token: z
    .string()
    .trim()
    .min(20, "Paste the whole token")
    .max(2000, "That is too long for an Instagram token")
    .regex(/^\S+$/, "The token has no spaces"),
});

export const setClientsPasswordSchema = z.object({
  password: z
    .string()
    .trim()
    .min(4, "Use at least 4 characters")
    .max(100, "Use at most 100 characters"),
});

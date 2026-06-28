// Zod
import { z } from "zod";

export const contactRequestSchema = z.object({
  id: z.number().int().positive(),
  reason: z.enum(["hire_services", "seek_representation"]),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  createdAt: z.coerce.date(),
});

export const getContactRequestSchema = contactRequestSchema.pick({
  id: true,
});

export const createContactRequestSchema = contactRequestSchema.pick({
  reason: true,
  email: true,
  message: true,
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
export type GetContactRequest = z.infer<typeof getContactRequestSchema>;
export type CreateContactRequest = z.infer<typeof createContactRequestSchema>;

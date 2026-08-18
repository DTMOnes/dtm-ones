import { z } from "zod";

export const createContactRequestSchema = z.object({
  reason: z.enum(["seeking_representation", "looking_for_a_player"], {
    message: "Please select seeking representation or looking for a player",
  }),
  email: z.email("Invalid email"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone must be at least 7 characters")
    .max(30, "Phone must be at most 30 characters"),
  message: z.string().min(1, "Message is required").max(5000),
});

export type CreateContactRequest = z.infer<typeof createContactRequestSchema>;

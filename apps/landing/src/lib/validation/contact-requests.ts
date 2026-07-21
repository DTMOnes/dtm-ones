import { z } from "zod";

export const createContactRequestSchema = z.object({
  type: z.enum(["player", "recruiter"], {
    message: "Please select Player or Recruiter",
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

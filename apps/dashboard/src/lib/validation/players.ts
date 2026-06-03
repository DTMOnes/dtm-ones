// Zod
import { z } from "zod";

// Schemas
import { playerCategorySchema } from "@/lib/validation/player-category";

export const playerSchema = z.object({
  id: z.uuid(),
  fullName: z.string().max(150),
  height: z
    .string()
    .max(20)
    .regex(/^\d{1,2}([.,]\d{1,2})?$/, {
      message: "Use a valid decimal number (e.g. 1.85 or 1,85)",
    }),
  dateOfBirth: z.string().max(50),
  nationality: z.string().max(100),
  lastClub: z.string().max(150),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  playerCategories: z.array(playerCategorySchema),
});

export const getPlayerSchema = playerSchema.pick({
  id: true,
});

export const createPlayerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(150, "Maximum 150 characters."),
  height: z
    .string()
    .trim()
    .min(1, "Height is required.")
    .max(20, "Maximum 20 digits."),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required.")
    .max(50, "Maximum 50 characters."),
  nationality: z
    .string()
    .trim()
    .min(1, "Nationality is required.")
    .max(100, "Maximum 100 characters."),
  lastClub: z
    .string()
    .trim()
    .min(1, "Last club is required.")
    .max(150, "Maximum 150 characters."),
  categoryIds: z
    .array(z.uuid({ message: "Each category must be a valid ID." }))
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Do not repeat the same category.",
    }),
});

export const updatePlayerSchema = z
  .object({
    id: z.uuid({ message: "Invalid player ID." }),
    fullName: z
      .string()
      .trim()
      .min(1, "Full name cannot be empty.")
      .max(150, "Maximum 150 characters."),
    height: z
      .string()
      .trim()
      .min(1, "Height cannot be empty.")
      .max(20, "Maximum 20 digits."),
    dateOfBirth: z
      .string()
      .trim()
      .min(1, "Date of birth cannot be empty.")
      .max(50, "Maximum 50 characters."),
    nationality: z
      .string()
      .trim()
      .min(1, "Nationality cannot be empty.")
      .max(100, "Maximum 100 characters."),
    lastClub: z
      .string()
      .trim()
      .min(1, "Last club cannot be empty.")
      .max(150, "Maximum 150 characters."),
    categoryIds: z
      .array(z.uuid({ message: "Each category must be a valid ID." }))
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Do not repeat the same category.",
      }),
  })
  .partial({
    fullName: true,
    height: true,
    dateOfBirth: true,
    nationality: true,
    lastClub: true,
    categoryIds: true,
  });

export const deletePlayerSchema = z.object({
  id: z.uuid({ message: "Invalid player ID." }),
});

export type PlayerData = z.infer<typeof playerSchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type DeletePlayerInput = z.infer<typeof deletePlayerSchema>;

// Zod
import { z } from "zod";

// Schemas
import { playerCategorySchema } from "@/lib/validation/player-category";
import { playerMediaSchema } from "@/lib/validation/player-media";

export const playerSchema = z.object({
  id: z.uuid(),
  fullName: z.string().max(150),
  height: z
    .string()
    .max(20)
    .regex(/^\d{1,2}([.,]\d{1,2})?$/, {
      message: "Usa un número decimal válido (ej. 1,85 o 1.85)",
    }),
  dateOfBirth: z.string().max(50),
  nationality: z.string().max(100),
  lastClub: z.string().max(150),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  playerCategories: z.array(playerCategorySchema),
  playerMedia: z.array(playerMediaSchema),
});

export const getPlayerSchema = playerSchema.pick({
  id: true,
});

export const createPlayerSchema = playerSchema
  .pick({
    fullName: true,
    height: true,
    dateOfBirth: true,
    nationality: true,
    lastClub: true,
  })
  .extend({
    playerCategories: z.array(z.string().min(1).max(100)),
  });

export const updatePlayerSchema = playerSchema
  .pick({
    id: true,
    fullName: true,
    height: true,
    dateOfBirth: true,
    nationality: true,
    lastClub: true,
  })
  .partial({
    fullName: true,
    height: true,
    dateOfBirth: true,
    nationality: true,
    lastClub: true,
  })
  .extend({
    playerCategories: z.array(z.string().min(1).max(100)),
  });

export type PlayerData = z.infer<typeof playerSchema>;
export type CreatePlayerData = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerData = z.infer<typeof updatePlayerSchema>;

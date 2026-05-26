import { z } from "zod";

const userRoleSchema = z.enum(["user", "admin"]);

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  password: z.string(),
  name: z.string(),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = userSchema
  .pick({
    email: true,
    password: true,
    name: true,
    role: true,
  })
  .extend({
    name: z.string().min(1, "El nombre es obligatorio."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
  });

export const updateUserSchema = userSchema
  .pick({
    id: true,
    email: true,
    password: true,
    name: true,
    role: true,
  })
  .partial({
    email: true,
    password: true,
    name: true,
    role: true,
  });

export const deleteUserSchema = userSchema.pick({
  id: true,
});

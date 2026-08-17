import { z } from "zod";

const userRoleSchema = z.enum(["owner", "staff"]);

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  role: userRoleSchema,
});

export const setUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: userRoleSchema,
});

export const deleteUserSchema = z.object({
  id: z.string().min(1),
});

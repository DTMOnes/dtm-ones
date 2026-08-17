import { z } from "zod";

const userRoleSchema = z.enum(["owner", "staff"]);
const userNameSchema = z.string().trim().min(1);

export const createUserSchema = z.object({
  name: userNameSchema,
  email: z.email(),
  password: z.string().min(8),
  role: userRoleSchema,
});

export const setUserNameSchema = z.object({
  userId: z.string().min(1),
  name: userNameSchema,
});

export const setUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: userRoleSchema,
});

export const deleteUserSchema = z.object({
  id: z.string().min(1),
});

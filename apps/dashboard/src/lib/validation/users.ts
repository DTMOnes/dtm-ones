import { z } from "zod";

const userRoleSchema = z.enum(["owner", "staff"]);

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: userRoleSchema,
});

export const setUserRoleSchema = z.object({
  userId: z.string().min(1, "User id is required."),
  role: userRoleSchema,
});

export const deleteUserSchema = z.object({
  id: z.string().min(1, "User id is required."),
});

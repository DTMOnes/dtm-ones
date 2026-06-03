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
    name: z.string().min(1, "Name is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
  });

export const updateUserGeneralSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required."),
  email: z.email("Enter a valid email address."),
});

export const changeUserPasswordSchema = z
  .object({
    userId: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const setUserRoleSchema = z.object({
  userId: z.string(),
  role: userRoleSchema,
});

export const deleteUserSchema = userSchema.pick({
  id: true,
});

"use server";

// Next
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Safe Action
import { flattenValidationErrors } from "next-safe-action";
import { actionClient } from "@/lib/safe-action";

// Better Auth
import { auth } from "@/lib/auth/auth";

// Validation Schema
import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from "@/lib/validation/users";

export const createUser = actionClient
  .metadata({ actionName: "createUser" })
  .inputSchema(createUserSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const newUser = await auth.api.createUser({
      body: {
        email: parsedInput.email,
        password: parsedInput.password,
        name: parsedInput.name,
        role: parsedInput.role,
      },
      headers: await headers(),
    });

    if (!newUser.user) {
      throw new Error("No se pudo crear el usuario.");
    }

    revalidatePath("/dashboard/users");

    return {
      success: true,
      message: "Usuario creado correctamente.",
    };
  });

export const updateUser = actionClient
  .metadata({ actionName: "updateUser" })
  .inputSchema(updateUserSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { id, password, ...rest } = parsedInput;

    const existingUser = await auth.api.getUser({
      query: {
        id,
      },
      headers: await headers(),
    });

    if (!existingUser) {
      throw new Error("User not found.");
    }

    const data: Record<string, unknown> = { ...rest };
    if (password !== undefined && password !== "") {
      data.password = password;
    }

    await auth.api.adminUpdateUser({
      body: {
        userId: id,
        data,
      },
      headers: await headers(),
    });

    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${id}`);

    return {
      success: true,
      message: "User updated successfully.",
    };
  });

export const deleteUser = actionClient
  .metadata({ actionName: "deleteUser" })
  .inputSchema(deleteUserSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const existingUser = await auth.api.getUser({
      query: {
        id: parsedInput.id,
      },
      headers: await headers(),
    });

    if (!existingUser) {
      throw new Error("User not found.");
    }

    await auth.api.removeUser({
      body: {
        userId: parsedInput.id,
      },
      headers: await headers(),
    });

    redirect("/dashboard/users");
  });

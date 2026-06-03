"use server";

// Next
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Safe Action
import { flattenValidationErrors } from "next-safe-action";
import { actionClient } from "@/lib/safe-action";

// Better Auth
import { auth } from "@/lib/auth/auth";

// Db + Drizzle
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Lib
import { countAdminUsers, isOnlyAdmin } from "@/lib/users/admin-count";

// Utils
import { assertAdmin } from "@/utils/require-admin";

// Validation Schema
import {
  createUserSchema,
  updateUserGeneralSchema,
  changeUserPasswordSchema,
  setUserRoleSchema,
  deleteUserSchema,
} from "@/lib/validation/users";

const validationErrorsShape = {
  handleValidationErrorsShape: async (
    errors: Parameters<typeof flattenValidationErrors>[0],
  ) => flattenValidationErrors(errors).fieldErrors,
};

export const createUser = actionClient
  .metadata({ actionName: "createUser" })
  .inputSchema(createUserSchema, validationErrorsShape)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

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
      throw new Error("Could not create user.");
    }

    revalidatePath("/users");

    return {
      success: true,
      message: "User created successfully.",
    };
  });

export const updateUserGeneral = actionClient
  .metadata({ actionName: "updateUserGeneral" })
  .inputSchema(updateUserGeneralSchema, validationErrorsShape)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const { id, name, email } = parsedInput;

    const existingUser = await auth.api.getUser({
      query: { id },
      headers: await headers(),
    });

    if (!existingUser) {
      throw new Error("User not found.");
    }

    await auth.api.adminUpdateUser({
      body: {
        userId: id,
        data: { name, email },
      },
      headers: await headers(),
    });

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  });

export const changeUserPassword = actionClient
  .metadata({ actionName: "changeUserPassword" })
  .inputSchema(changeUserPasswordSchema, validationErrorsShape)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const { userId, password } = parsedInput;

    const existingUser = await auth.api.getUser({
      query: { id: userId },
      headers: await headers(),
    });

    if (!existingUser) {
      throw new Error("User not found.");
    }

    await auth.api.setUserPassword({
      body: {
        userId,
        newPassword: password,
      },
      headers: await headers(),
    });

    revalidatePath(`/users/${userId}`);

    return {
      success: true,
      message: "Password updated successfully.",
    };
  });

export const setUserRole = actionClient
  .metadata({ actionName: "setUserRole" })
  .inputSchema(setUserRoleSchema, validationErrorsShape)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const { userId, role } = parsedInput;

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!targetUser) {
      throw new Error("User not found.");
    }

    const adminCount = await countAdminUsers();

    if (
      isOnlyAdmin(targetUser, adminCount) &&
      role !== "admin"
    ) {
      throw new Error(
        "Cannot remove administrator role from the only admin. Promote another user or create a new administrator first.",
      );
    }

    await auth.api.setRole({
      body: {
        userId,
        role,
      },
      headers: await headers(),
    });

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);

    return {
      success: true,
      message: "Role updated successfully.",
    };
  });

export const deleteUser = actionClient
  .metadata({ actionName: "deleteUser" })
  .inputSchema(deleteUserSchema, validationErrorsShape)
  .action(async ({ parsedInput }) => {
    const session = await assertAdmin();

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, parsedInput.id),
    });

    if (!targetUser) {
      throw new Error("User not found.");
    }

    const adminCount = await countAdminUsers();

    if (isOnlyAdmin(targetUser, adminCount)) {
      throw new Error(
        "Cannot delete the only administrator. Promote another user or create a new administrator first.",
      );
    }

    if (parsedInput.id === session.user.id) {
      throw new Error("You cannot delete your own account.");
    }

    await auth.api.removeUser({
      body: {
        userId: parsedInput.id,
      },
      headers: await headers(),
    });

    revalidatePath("/users");

    return {
      success: true,
      message: "User deleted successfully.",
    };
  });

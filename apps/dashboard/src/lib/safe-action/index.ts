import "server-only";

import { betterAuth } from "@next-safe-action/adapter-better-auth";
import { APIError } from "better-auth/api";
import { forbidden, unauthorized } from "next/navigation";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import z from "zod";

import { auth } from "@/lib/auth";
import {
  AppError,
  ForbiddenError,
  UnauthorizedError,
} from "@/utils/errors";

function logActionError(
  actionName: string,
  error: Error,
  fields: { code: string; userId?: string; role?: string },
) {
  console.error({
    actionName,
    message: error.message,
    stack: error.stack,
    ...fields,
  });
}

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(e, { metadata }): { code: string; message: string } {
    const { actionName } = metadata;

    if (e instanceof AppError) {
      logActionError(
        actionName,
        e,
        e instanceof ForbiddenError
          ? { code: e.code, userId: e.userId, role: e.role }
          : { code: e.code },
      );

      if (e instanceof UnauthorizedError) {
        unauthorized();
      }

      if (e instanceof ForbiddenError) {
        forbidden();
      }

      return { code: e.code, message: e.message };
    }

    if (e instanceof APIError) {
      const code = e.body?.code;
      logActionError(actionName, e, { code: code ?? "INTERNAL" });

      if (code === "INVALID_EMAIL_OR_PASSWORD") {
        return { code, message: e.message };
      }

      return {
        code: "INTERNAL",
        message: DEFAULT_SERVER_ERROR_MESSAGE,
      };
    }

    logActionError(actionName, e, { code: "INTERNAL" });
    return {
      code: "INTERNAL",
      message: DEFAULT_SERVER_ERROR_MESSAGE,
    };
  },
});

export const staffActionClient = actionClient.use(
  betterAuth(auth, {
    authorize: ({ authData, next }) => {
      if (
        !authData ||
        (authData.user.role !== "owner" && authData.user.role !== "staff")
      ) {
        throw new UnauthorizedError();
      }

      return next({ ctx: { auth: authData } });
    },
  }),
);

export const ownerActionClient = actionClient.use(
  betterAuth(auth, {
    authorize: ({ authData, next }) => {
      if (
        !authData ||
        (authData.user.role !== "owner" && authData.user.role !== "staff")
      ) {
        throw new UnauthorizedError();
      }

      if (authData.user.role !== "owner") {
        throw new ForbiddenError(authData.user.id, authData.user.role);
      }

      return next({ ctx: { auth: authData } });
    },
  }),
);

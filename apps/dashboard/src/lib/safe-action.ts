import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

import {
  ActionError,
  ForbiddenActionError,
  ServiceUnavailableActionError,
  UnauthorizedActionError,
  normalizeCause,
  type ExpectedActionErrorCode,
} from "@/lib/action-errors";
import type { DashboardUser } from "@/lib/auth/types";
import { createInsforgeServer } from "@/lib/insforge-server";

export type ActionServerError = {
  code: ExpectedActionErrorCode | "unexpected_error";
  message: string;
  retryable: boolean;
};

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(error): ActionServerError {
    if (error instanceof ActionError) {
      console.error("[safe-action]", {
        name: error.name,
        code: error.code,
        retryable: error.retryable,
        context: error.context,
        cause: error.cause,
      });

      return {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
      };
    }

    console.error("[safe-action]", error);
    return {
      code: "unexpected_error",
      message: "Something went wrong. Please try again.",
      retryable: false,
    };
  },
});

export const authClient = actionClient.use(async ({ next, metadata }) => {
  const context = { actionName: metadata.actionName };
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (!data.user) {
    throw new UnauthorizedActionError({
      message: "Please sign in to continue.",
      context,
    });
  }

  if (error) {
    throw new ServiceUnavailableActionError({
      message:
        "Authentication is temporarily unavailable. Please try again in a moment.",
      context,
      cause: normalizeCause(error),
    });
  }

  return next({ ctx: { user: data.user } });
});

export const staffClient = authClient.use(async ({ next, ctx, metadata }) => {
  const { role } = ctx.user.metadata as { role: "owner" | "staff" };
  if (role !== "owner" && role !== "staff") {
    throw new ForbiddenActionError({
      message: "You are not allowed to perform this action.",
      context: { actionName: metadata.actionName },
    });
  }

  const user: DashboardUser = {
    id: ctx.user.id,
    email: ctx.user.email,
    role,
  };

  return next({ ctx: { user } });
});

export const ownerClient = staffClient.use(async ({ next, ctx, metadata }) => {
  if (ctx.user.role !== "owner") {
    throw new ForbiddenActionError({
      message: "You are not allowed to perform this action.",
      context: { actionName: metadata.actionName },
    });
  }
  return next({ ctx });
});

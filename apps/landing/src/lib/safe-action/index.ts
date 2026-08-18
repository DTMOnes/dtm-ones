import "server-only";

import { forbidden, unauthorized } from "next/navigation";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { z } from "zod";

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

    logActionError(actionName, e, { code: "INTERNAL" });
    return {
      code: "INTERNAL",
      message: DEFAULT_SERVER_ERROR_MESSAGE,
    };
  },
});

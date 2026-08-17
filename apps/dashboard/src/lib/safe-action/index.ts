import "server-only";

import { betterAuth } from "@next-safe-action/adapter-better-auth";
import { forbidden, unauthorized } from "next/navigation";
import {
  createSafeActionClient,
  isNavigationError,
} from "next-safe-action";
import z from "zod";

import { auth } from "@/lib/auth";
import { isDashboardRole } from "@/utils/auth/user-from-better-auth";
import {
  ForbiddenError,
  UnauthorizedError,
  interpretActionError,
} from "@/utils/errors";

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(e, { metadata }) {
    if (isNavigationError(e)) {
      throw e;
    }

    const interpreted = interpretActionError(e, metadata);
    console.error(interpreted.log);

    if (interpreted.navigation === "unauthorized") {
      unauthorized();
    }

    if (interpreted.navigation === "forbidden") {
      forbidden();
    }

    return interpreted.client;
  },
});

export const staffActionClient = actionClient.use(
  betterAuth(auth, {
    authorize: ({ authData, next }) => {
      if (!authData || !isDashboardRole(authData.user.role)) {
        throw new UnauthorizedError();
      }

      return next({ ctx: { auth: authData } });
    },
  }),
);

export const ownerActionClient = actionClient.use(
  betterAuth(auth, {
    authorize: ({ authData, next }) => {
      if (!authData || !isDashboardRole(authData.user.role)) {
        throw new UnauthorizedError();
      }

      if (authData.user.role !== "owner") {
        throw new ForbiddenError(authData.user.id, authData.user.role);
      }

      return next({ ctx: { auth: authData } });
    },
  }),
);

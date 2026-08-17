import "server-only";

import { betterAuth } from "@next-safe-action/adapter-better-auth";
import { unauthorized } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";

import { auth } from "@/lib/auth";

export const actionClient = createSafeActionClient();

export const staffActionClient = actionClient.use(
  betterAuth(auth, {
    authorize: ({ authData, next }) => {
      if (
        !authData ||
        (authData.user.role !== "admin" && authData.user.role !== "user")
      ) {
        unauthorized();
      }

      return next({ ctx: { auth: authData } });
    },
  }),
);

export const ownerActionClient = actionClient.use(
  betterAuth(auth, {
    authorize: ({ authData, next }) => {
      if (!authData || authData.user.role !== "admin") {
        unauthorized();
      }

      return next({ ctx: { auth: authData } });
    },
  }),
);

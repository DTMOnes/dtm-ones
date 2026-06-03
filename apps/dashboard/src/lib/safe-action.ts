import { createSafeActionClient } from "next-safe-action";
import { betterAuth } from "@next-safe-action/adapter-better-auth";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(error, utils) {
    console.error(error);
    return "Error al procesar la acción. Por favor, inténtelo de nuevo.";
  },
});

export const authClient = actionClient.use(betterAuth(auth));

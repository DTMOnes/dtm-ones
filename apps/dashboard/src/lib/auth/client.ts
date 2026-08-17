import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

import { ac, owner, staff } from "@/lib/auth/access";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    adminClient({
      ac,
      roles: {
        owner,
        staff,
      },
    }),
  ],
});

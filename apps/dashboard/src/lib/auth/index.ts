import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { schema } from "@dtm/database";

import { env } from "@/config/env";
import { ac, owner, staff } from "@/lib/auth/access";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    transaction: false,
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
  },
  plugins: [
    admin({
      ac,
      roles: {
        owner,
        staff,
      },
      defaultRole: "staff",
      adminRoles: ["owner"],
    }),
    nextCookies(),
  ],
});

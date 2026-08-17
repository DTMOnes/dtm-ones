import { loadEnvConfig } from "@next/env";
import { createDatabase, schema } from "@dtm/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import path from "node:path";

import { ac, owner, staff } from "../lib/auth/access";

loadEnvConfig(path.resolve(__dirname, "../../../.."), undefined, undefined, true);

async function main(): Promise<void> {
  const email = process.env.DEV_SEED_ADMIN_EMAIL;
  const password = process.env.DEV_SEED_ADMIN_PASSWORD;
  const name = process.env.DEV_SEED_ADMIN_NAME ?? "Owner";

  if (!email || !password) {
    throw new Error(
      "Set DEV_SEED_ADMIN_EMAIL and DEV_SEED_ADMIN_PASSWORD before seeding.",
    );
  }

  if (
    !process.env.DATABASE_URL ||
    !process.env.BETTER_AUTH_SECRET ||
    !process.env.BETTER_AUTH_URL
  ) {
    throw new Error(
      "DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL are required.",
    );
  }

  const db = createDatabase(process.env.DATABASE_URL);

  const seedAuth = betterAuth({
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
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
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
    ],
  });

  const [existing] = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);

  let userId: string;

  if (existing) {
    userId = existing.id;
    console.log("SEED_OWNER_EXISTS", userId);
  } else {
    const created = await seedAuth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!created.user?.id) {
      throw new Error("Better Auth signUpEmail returned no user id");
    }

    userId = created.user.id;
    console.log("SEED_OWNER_CREATED", userId);
  }

  await db
    .update(schema.user)
    .set({ role: "owner" })
    .where(eq(schema.user.id, userId));

  console.log(
    "SEED_OWNER_OK",
    JSON.stringify({ userId, email, role: "owner" }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

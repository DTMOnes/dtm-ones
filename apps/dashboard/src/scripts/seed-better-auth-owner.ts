import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { Pool } from "pg";

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

  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL) {
    throw new Error("DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL are required.");
  }

  const { betterAuth } = await import("better-auth");
  const { admin } = await import("better-auth/plugins");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query("SET search_path TO better_auth, public");

    const existing = await client.query(
      `SELECT id, email FROM better_auth."user" WHERE email = $1 LIMIT 1`,
      [email],
    );

    let userId: string;

    if (existing.rows[0]) {
      userId = existing.rows[0].id as string;
      console.log("SEED_OWNER_EXISTS", userId);
    } else {
      const seedAuth = betterAuth({
        database: pool,
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        emailAndPassword: {
          enabled: true,
          disableSignUp: false,
          requireEmailVerification: false,
        },
        plugins: [
          admin({
            defaultRole: "user",
            adminRoles: ["admin"],
          }),
        ],
      });

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

    await client.query(
      `UPDATE better_auth."user" SET role = 'admin' WHERE id = $1`,
      [userId],
    );

    await client.query(`
      DROP POLICY IF EXISTS users_select_own_or_owner ON public.users;
      DROP POLICY IF EXISTS users_insert_owner ON public.users;
      DROP POLICY IF EXISTS users_update_owner ON public.users;
      DROP POLICY IF EXISTS users_delete_owner ON public.users;
    `);

    await client.query(`
      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
    `);

    await client.query(`DELETE FROM public.users;`);

    await client.query(`
      ALTER TABLE public.users
        ALTER COLUMN id TYPE text USING id::text;
    `);

    await client.query(
      `
      INSERT INTO public.users (id, email, role)
      VALUES ($1, $2, 'owner')
      ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            role = EXCLUDED.role,
            updated_at = now();
    `,
      [userId, email],
    );

    await client.query(`
      ALTER TABLE public.users
        DROP CONSTRAINT IF EXISTS users_id_fkey;
    `);

    await client.query(`
      ALTER TABLE public.users
        ADD CONSTRAINT users_id_fkey
        FOREIGN KEY (id) REFERENCES better_auth."user"(id)
        ON DELETE CASCADE;
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION public.is_dashboard_staff()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $$
        SELECT EXISTS (
          SELECT 1
          FROM public.users u
          WHERE u.id = public.requesting_user_id()
            AND u.role IN ('owner', 'staff')
        );
      $$;
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION public.is_dashboard_owner()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $$
        SELECT EXISTS (
          SELECT 1
          FROM public.users u
          WHERE u.id = public.requesting_user_id()
            AND u.role = 'owner'
        );
      $$;
    `);

    await client.query(`
      CREATE POLICY users_select_own_or_owner
        ON public.users
        FOR SELECT
        TO authenticated
        USING (
          id = public.requesting_user_id()
          OR is_dashboard_owner()
        );
    `);

    await client.query(`
      CREATE POLICY users_insert_owner
        ON public.users
        FOR INSERT
        TO authenticated
        WITH CHECK (is_dashboard_owner());
    `);

    await client.query(`
      CREATE POLICY users_update_owner
        ON public.users
        FOR UPDATE
        TO authenticated
        USING (is_dashboard_owner())
        WITH CHECK (is_dashboard_owner());
    `);

    await client.query(`
      CREATE POLICY users_delete_owner
        ON public.users
        FOR DELETE
        TO authenticated
        USING (is_dashboard_owner());
    `);

    console.log(
      "SEED_REMOUNT_OK",
      JSON.stringify({ userId, email, role: "owner" }),
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

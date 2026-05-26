import { loadEnvConfig } from "@next/env";
import { z } from "zod";

loadEnvConfig(process.cwd());

const seedSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

async function main() {
  const seed = seedSchema.parse({
    email: process.env.DEV_SEED_ADMIN_EMAIL,
    password: process.env.DEV_SEED_ADMIN_PASSWORD,
    name: process.env.DEV_SEED_ADMIN_NAME,
  });

  const { auth } = await import("@/lib/auth/auth");

  const newUser = await auth.api.createUser({
    body: {
      email: seed.email,
      password: seed.password,
      name: seed.name,
      role: "admin",
    },
  });

  if (!newUser) {
    throw new Error("Error creating admin user.");
  }

  console.log("Admin user created successfully.", seed.email);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import jwt from "jsonwebtoken";

import { env } from "@/config/env";

export function signBridgeAccessToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      role: "authenticated",
      aud: "insforge-api",
    },
    env.INSFORGE_JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    },
  );
}

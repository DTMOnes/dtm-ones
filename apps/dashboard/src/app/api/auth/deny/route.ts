import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const BETTER_AUTH_COOKIES = [
  "better-auth.session_token",
  "better-auth.session_data",
  "better-auth.dont_remember",
] as const;

/**
 * Clears a Better Auth session that has no public.users role, then sends
 * the browser to /signin with a denial flag. Used because Server Component
 * layouts cannot modify cookies.
 */
export async function GET(request: Request) {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("[auth/deny]", error);
  }

  const url = new URL("/signin", request.url);
  url.searchParams.set("denied", "1");
  const response = NextResponse.redirect(url);

  for (const name of BETTER_AUTH_COOKIES) {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

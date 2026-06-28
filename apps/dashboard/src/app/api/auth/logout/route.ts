// Next
import { NextResponse } from "next/server";

// Config
import { env } from "@/config/env";

// Lib
import { clearAuthCookies, getRefreshToken } from "@/lib/api/cookies";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await fetch(`${env.API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });
    } catch {
      // Ignore upstream logout failures; local cookies are cleared regardless.
    }
  }

  await clearAuthCookies();

  return NextResponse.json(
    { message: "Signed out successfully." },
    { status: 200 },
  );
}

// Next
import { NextResponse } from "next/server";

// Config
import { env } from "@/config/env";

// Lib
import { setAuthCookies } from "@/lib/api/cookies";
import type { ApiTokenResponse } from "@/lib/api/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "Invalid request body." },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${env.API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!upstream.ok) {
    // Forward the FastAPI error body/status untouched so the client can parse
    // `{ detail }` through buildApiError.
    const detail = await upstream.text();
    return new NextResponse(detail, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  }

  const data = (await upstream.json()) as ApiTokenResponse;
  await setAuthCookies({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessMaxAge: data.expires_in,
  });

  return NextResponse.json({ user: data.user }, { status: 200 });
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { signBridgeAccessToken } from "@/lib/insforge-bridge";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const token = signBridgeAccessToken(session.user.id);

  return NextResponse.json(
    { token },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}

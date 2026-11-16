import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { db } from "@/lib/db";
import { refreshInstagramToken } from "@/utils/instagram-token";

/**
 * Vercel Cron (apps/dashboard/vercel.json), weekly: renews the Instagram token so it
 * never reaches its 60 days. Vercel authenticates with "Bearer <CRON_SECRET>".
 */
export async function GET(request: Request) {
  if (
    !env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const expiresAt = await refreshInstagramToken(db);
    return NextResponse.json({ ok: true, expiresAt });
  } catch (error) {
    console.error({ source: "cron:instagram-token", message: (error as Error).message });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

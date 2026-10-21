import { NextResponse, type NextRequest } from "next/server";

import { PLAYERS_ACCESS_COOKIE } from "@/lib/roster/constants";

/** Visiting Home locks the Players page again, so it asks for the password next time. */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  // Link prefetches of "/" are not visits; ignore them or the lock would fire while browsing Players.
  const isPrefetch =
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch" ||
    (request.headers.get("sec-purpose") ?? "").includes("prefetch");

  if (!isPrefetch && request.cookies.has(PLAYERS_ACCESS_COOKIE)) {
    response.cookies.delete(PLAYERS_ACCESS_COOKIE);
  }

  return response;
}

export const config = {
  matcher: ["/"],
};

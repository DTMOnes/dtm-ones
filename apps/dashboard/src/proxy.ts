// Next
import { NextResponse, type NextRequest } from "next/server";

// Lib
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  authCookieOptions,
} from "@/lib/api/cookie-config";
import type { ApiTokenResponse } from "@/lib/api/types";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

function isSigninRoute(pathname: string): boolean {
  return pathname === "/auth/signin" || pathname.startsWith("/auth/signin/");
}

async function tryRefresh(refreshToken: string): Promise<ApiTokenResponse | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as ApiTokenResponse;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signin = isSigninRoute(pathname);

  const access = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let authed = Boolean(access);
  let refreshed: ApiTokenResponse | null = null;

  // Access cookie expired (or missing) but a refresh token is present: refresh
  // proactively here so downstream Server Components see a valid token.
  if (!authed && refresh) {
    refreshed = await tryRefresh(refresh);
    authed = Boolean(refreshed);
  }

  const finalize = (response: NextResponse) => {
    if (refreshed) {
      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        refreshed.access_token,
        authCookieOptions(refreshed.expires_in),
      );
      response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        refreshed.refresh_token,
        authCookieOptions(REFRESH_TOKEN_MAX_AGE),
      );
    } else if (!authed && refresh) {
      // Refresh failed: drop the stale cookies.
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
    }
    return response;
  };

  if (authed && signin) {
    return finalize(NextResponse.redirect(new URL("/", request.url)));
  }

  if (!authed && !signin) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return finalize(NextResponse.redirect(url));
  }

  return finalize(NextResponse.next());
}

export const config = {
  // Run on all routes except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

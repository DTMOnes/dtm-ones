import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_ACCESS_TOKEN_COOKIE,
  DEFAULT_REFRESH_TOKEN_COOKIE,
  updateSession,
  type CookieStore,
} from "@insforge/sdk/ssr/middleware";

function isSigninRoute(pathname: string): boolean {
  return pathname === "/signin" || pathname.startsWith("/signin/");
}

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
}

function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete(DEFAULT_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(DEFAULT_REFRESH_TOKEN_COOKIE);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signin = isSigninRoute(pathname);

  const response = NextResponse.next({ request });

  const session = await updateSession({
    // Next.js cookie APIs are compatible at runtime with the InsForge CookieStore.
    requestCookies: request.cookies as unknown as CookieStore,
    responseCookies: response.cookies as unknown as CookieStore,
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  });

  const authed = Boolean(session.accessToken);

  if (!authed && session.error) {
    clearSessionCookies(response);
  }

  if (authed && signin) {
    const redirectResponse = NextResponse.redirect(
      new URL("/contacts", request.url),
    );
    return copyCookies(response, redirectResponse);
  }

  if (!authed && !signin) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    const redirectResponse = NextResponse.redirect(url);
    clearSessionCookies(redirectResponse);
    return copyCookies(response, redirectResponse);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

function isSigninRoute(pathname: string): boolean {
  return pathname === "/signin" || pathname.startsWith("/signin/");
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signin = isSigninRoute(pathname);

  // Cookie presence only gates protected routes. Do not send cookie holders
  // away from /signin here: a cookie can exist without a public.users role
  // (or after the DB session was cleared). That bounce fights the dashboard
  // layout and loops. Signed in Owner/Staff leave /signin via getSession.
  const sessionCookie = getSessionCookie(request);
  const hasSessionCookie = Boolean(sessionCookie);

  if (!hasSessionCookie && !signin) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

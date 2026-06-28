/**
 * Pure cookie configuration shared between the Node runtime (route handlers /
 * server components via `cookies.ts`) and the proxy (`proxy.ts`).
 *
 * IMPORTANT: keep this file free of `next/headers` and `server-only` imports so
 * it stays importable from the proxy.
 */

export const ACCESS_TOKEN_COOKIE = "dtm_access";
export const REFRESH_TOKEN_COOKIE = "dtm_refresh";

/** Refresh token lifetime in seconds (mirrors API AUTH_REFRESH_TOKEN_EXPIRE_DAYS = 30). */
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

export function authCookieOptions(maxAge: number): AuthCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

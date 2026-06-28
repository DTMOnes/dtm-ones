// Next
// `next/headers` is server-only; importing it in a Client Component fails the
// build, which keeps these helpers from leaking to the browser.
import { cookies } from "next/headers";

// Config
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  authCookieOptions,
} from "@/lib/api/cookie-config";

type SetAuthCookiesInput = {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds (from the API `expires_in`). */
  accessMaxAge: number;
};

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

/** Only callable from Route Handlers or Server Actions (writes cookies). */
export async function setAuthCookies({
  accessToken,
  refreshToken,
  accessMaxAge,
}: SetAuthCookiesInput): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, authCookieOptions(accessMaxAge));
  store.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    authCookieOptions(REFRESH_TOKEN_MAX_AGE),
  );
}

/** Only callable from Route Handlers or Server Actions (writes cookies). */
export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

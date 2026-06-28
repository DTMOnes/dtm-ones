// Next
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// Config
import { env } from "@/config/env";

// Lib
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  authCookieOptions,
} from "@/lib/api/cookie-config";
import type { ApiTokenResponse } from "@/lib/api/types";

type RouteContext = { params: Promise<{ path: string[] }> };

/**
 * Generic same-origin proxy for client-side data calls. The browser never holds
 * the access token (httpOnly cookies); this handler injects the Bearer header
 * and transparently refreshes on a 401 before retrying once.
 */
async function refreshAccessToken(): Promise<string | null> {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return null;

  const upstream = await fetch(`${env.API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    store.delete(ACCESS_TOKEN_COOKIE);
    store.delete(REFRESH_TOKEN_COOKIE);
    return null;
  }

  const data = (await upstream.json()) as ApiTokenResponse;
  store.set(
    ACCESS_TOKEN_COOKIE,
    data.access_token,
    authCookieOptions(data.expires_in),
  );
  store.set(
    REFRESH_TOKEN_COOKIE,
    data.refresh_token,
    authCookieOptions(REFRESH_TOKEN_MAX_AGE),
  );
  return data.access_token;
}

async function proxy(request: NextRequest, path: string[]) {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;

  const targetUrl = `${env.API_URL}/${path.join("/")}${request.nextUrl.search}`;
  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const bodyBuffer = hasBody ? await request.arrayBuffer() : undefined;

  const buildHeaders = (token: string | null) => {
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const accept = request.headers.get("accept");
    if (accept) headers.set("accept", accept);
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  };

  const send = (token: string | null) =>
    fetch(targetUrl, {
      method,
      headers: buildHeaders(token),
      body: hasBody ? bodyBuffer : undefined,
      cache: "no-store",
    });

  let upstream = await send(accessToken);

  if (upstream.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      upstream = await send(refreshed);
    }
  }

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(request, path);
}

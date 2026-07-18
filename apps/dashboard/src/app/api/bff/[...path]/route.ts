import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_ACCESS_TOKEN_COOKIE } from "@insforge/sdk/ssr/middleware";

import { env } from "@/config/env";

type RouteContext = { params: Promise<{ path: string[] }> };

/**
 * Generic same-origin proxy for client-side legacy FastAPI data calls.
 * Injects the InsForge access token as Bearer. FastAPI Auth is removed; these
 * calls will keep failing until each feature migrates to InsForge.
 */
async function proxy(request: NextRequest, path: string[]) {
  const store = await cookies();
  const accessToken = store.get(DEFAULT_ACCESS_TOKEN_COOKIE)?.value ?? null;

  const targetUrl = `${env.API_URL}/${path.join("/")}${request.nextUrl.search}`;
  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const bodyBuffer = hasBody ? await request.arrayBuffer() : undefined;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? bodyBuffer : undefined,
    cache: "no-store",
  });

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

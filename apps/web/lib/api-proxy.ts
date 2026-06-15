import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const defaultApiUrl = "http://localhost:4000";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export function backendUrl(path: string, search = "") {
  const base = process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl;
  const normalizedBase = base.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}${search}`;
}

export async function proxyApiRoute(request: Request, context: RouteContext, modulePath: string) {
  const store = await cookies();
  const token = store.get("erp_access_token")?.value;
  const { path } = await context.params;
  const url = new URL(request.url);
  const target = backendUrl(`/api/v1/${modulePath}/${path.join("/")}`, url.search);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

  const response = await fetch(target, {
    method: request.method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      "content-type": request.headers.get("content-type") ?? "application/json"
    },
    body,
    cache: "no-store"
  });

  const payload = await response.arrayBuffer();
  return new NextResponse(payload, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
      ...(response.headers.get("content-disposition") ? { "content-disposition": response.headers.get("content-disposition")! } : {})
    }
  });
}

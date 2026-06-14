import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function proxy(request: Request, params: Promise<{ path: string[] }>) {
  const store = await cookies();
  const token = store.get("erp_access_token")?.value;
  const { path } = await params;
  const url = new URL(request.url);
  const target = `${apiUrl}/api/v1/examination/${path.join("/")}${url.search}`;
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

export function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params);
}

export function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params);
}

export function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params);
}

export function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params);
}

import { proxyApiRoute } from "../../../../lib/api-proxy";

export function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyApiRoute(request, context, "production-readiness");
}

export function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyApiRoute(request, context, "production-readiness");
}

export function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyApiRoute(request, context, "production-readiness");
}

export function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyApiRoute(request, context, "production-readiness");
}
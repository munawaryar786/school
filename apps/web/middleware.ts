import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@school-erp/shared";
import { homePathForRole } from "./lib/role-routes";
import { canAccessRoute, findProtectedPrefix } from "./lib/route-policy";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("erp_access_token")?.value;
  const role = request.cookies.get("erp_role")?.value as Role | undefined;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = token && role ? homePathForRole(role) : "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && token && role) {
    const url = request.nextUrl.clone();
    url.pathname = homePathForRole(role);
    return NextResponse.redirect(url);
  }

  const matchedPrefix = findProtectedPrefix(pathname);
  if (!matchedPrefix) {
    return NextResponse.next();
  }

  if (!token || !role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!canAccessRoute(role, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/super-admin/:path*", "/school-admin/:path*", "/admissions/:path*", "/academic/:path*", "/attendance/:path*", "/examination/:path*", "/lms/:path*", "/finance/:path*", "/advanced-finance/:path*", "/hr/:path*", "/library/:path*", "/communication/:path*", "/reports/:path*", "/documents/:path*", "/certificates/:path*", "/meetings/:path*", "/cms/:path*", "/mobile/:path*", "/security/:path*", "/production-readiness/:path*", "/teacher/:path*", "/student/:path*", "/parent/:path*"]
};

import { NextResponse, type NextRequest } from "next/server";
import { ROLES, type Role } from "@school-erp/shared";

const protectedPrefixes = [
  "/super-admin",
  "/school-admin",
  "/admissions",
  "/academic",
  "/attendance",
  "/examination",
  "/lms",
  "/finance",
  "/advanced-finance",
  "/hr",
  "/library",
  "/communication",
  "/reports",
  "/documents",
  "/certificates",
  "/meetings",
  "/cms",
  "/mobile",
  "/security",
  "/production-readiness",
  "/teacher",
  "/student",
  "/parent"
] as const;

const roleRoute: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "/super-admin",
  [ROLES.SCHOOL_ADMIN]: "/school-admin",
  [ROLES.TEACHER]: "/teacher",
  [ROLES.STUDENT]: "/student",
  [ROLES.PARENT]: "/parent",
  [ROLES.STAFF]: "/school-admin",
  [ROLES.FINANCE_OFFICER]: "/finance",
  [ROLES.LIBRARIAN]: "/library",
  [ROLES.HR_OFFICER]: "/hr"
};

const routeRole: Record<string, Role[]> = {
  "/super-admin": [ROLES.SUPER_ADMIN],
  "/school-admin": [ROLES.SCHOOL_ADMIN, ROLES.STAFF, ROLES.FINANCE_OFFICER, ROLES.LIBRARIAN, ROLES.HR_OFFICER],
  "/admissions": [ROLES.SCHOOL_ADMIN, ROLES.STAFF],
  "/academic": [ROLES.SCHOOL_ADMIN, ROLES.STAFF],
  "/attendance": [ROLES.SCHOOL_ADMIN, ROLES.STAFF, ROLES.HR_OFFICER],
  "/examination": [ROLES.SCHOOL_ADMIN, ROLES.STAFF, ROLES.TEACHER],
  "/lms": [ROLES.SCHOOL_ADMIN, ROLES.STAFF, ROLES.TEACHER, ROLES.STUDENT],
  "/finance": [ROLES.SCHOOL_ADMIN, ROLES.FINANCE_OFFICER],
  "/advanced-finance": [ROLES.SCHOOL_ADMIN, ROLES.FINANCE_OFFICER],
  "/hr": [ROLES.SCHOOL_ADMIN, ROLES.HR_OFFICER],
  "/library": [ROLES.SCHOOL_ADMIN, ROLES.LIBRARIAN],
  "/communication": [ROLES.SCHOOL_ADMIN, ROLES.STAFF, ROLES.TEACHER],
  "/reports": [ROLES.SCHOOL_ADMIN, ROLES.STAFF, ROLES.FINANCE_OFFICER, ROLES.HR_OFFICER],
  "/documents": [ROLES.SCHOOL_ADMIN, ROLES.STAFF, ROLES.HR_OFFICER],
  "/certificates": [ROLES.SCHOOL_ADMIN, ROLES.STAFF],
  "/meetings": [ROLES.SCHOOL_ADMIN, ROLES.STAFF, ROLES.TEACHER],
  "/cms": [ROLES.SCHOOL_ADMIN, ROLES.STAFF],
  "/mobile": [ROLES.SCHOOL_ADMIN, ROLES.STAFF],
  "/security": [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN],
  "/production-readiness": [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN],
  "/teacher": [ROLES.TEACHER],
  "/student": [ROLES.STUDENT],
  "/parent": [ROLES.PARENT]
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("erp_access_token")?.value;
  const role = request.cookies.get("erp_role")?.value as Role | undefined;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = token && role ? roleRoute[role] : "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && token && role) {
    const url = request.nextUrl.clone();
    url.pathname = roleRoute[role];
    return NextResponse.redirect(url);
  }

  const matchedPrefix = protectedPrefixes.find((prefix) => pathname.startsWith(prefix));
  if (!matchedPrefix) {
    return NextResponse.next();
  }

  if (!token || !role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!routeRole[matchedPrefix].includes(role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/super-admin/:path*", "/school-admin/:path*", "/admissions/:path*", "/academic/:path*", "/attendance/:path*", "/examination/:path*", "/lms/:path*", "/finance/:path*", "/advanced-finance/:path*", "/hr/:path*", "/library/:path*", "/communication/:path*", "/reports/:path*", "/documents/:path*", "/certificates/:path*", "/meetings/:path*", "/cms/:path*", "/mobile/:path*", "/security/:path*", "/production-readiness/:path*", "/teacher/:path*", "/student/:path*", "/parent/:path*"]
};

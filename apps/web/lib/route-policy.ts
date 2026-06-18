import { ROLES, type Role } from "@school-erp/shared";

export const routeAccess = {
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
} as const satisfies Record<string, readonly Role[]>;

export const protectedPrefixes = Object.keys(routeAccess) as Array<keyof typeof routeAccess>;

export function findProtectedPrefix(pathname: string) {
  return protectedPrefixes.find((prefix) => pathname.startsWith(prefix)) ?? null;
}

export function canAccessRoute(role: Role, pathname: string) {
  const prefix = findProtectedPrefix(pathname);
  return prefix ? (routeAccess[prefix] as readonly Role[]).includes(role) : true;
}

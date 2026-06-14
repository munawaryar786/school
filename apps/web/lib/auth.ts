import { cookies } from "next/headers";
import { ROLE_THEME, ROLES, type Role } from "@school-erp/shared";

export type Session = {
  token: string;
  role: Role;
  name: string;
  schoolId: string | null;
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get("erp_access_token")?.value;
  const role = store.get("erp_role")?.value as Role | undefined;
  const name = store.get("erp_name")?.value;
  const schoolId = store.get("erp_school_id")?.value ?? null;

  if (!token || !role || !name || !Object.values(ROLES).includes(role)) {
    return null;
  }

  return {
    token,
    role,
    name,
    schoolId
  };
}

export function dashboardPathFor(role: Role) {
  const routes: Record<Role, string> = {
    [ROLES.SUPER_ADMIN]: "/super-admin",
    [ROLES.SCHOOL_ADMIN]: "/school-admin",
    [ROLES.TEACHER]: "/teacher",
    [ROLES.STUDENT]: "/student",
    [ROLES.PARENT]: "/parent",
    [ROLES.STAFF]: "/school-admin",
    [ROLES.FINANCE_OFFICER]: "/school-admin",
    [ROLES.LIBRARIAN]: "/school-admin",
    [ROLES.HR_OFFICER]: "/school-admin"
  };
  return routes[role];
}

export function themeFor(role: Role) {
  return ROLE_THEME[role];
}


import { cookies } from "next/headers";
import { ROLE_THEME, ROLES, type Role } from "@school-erp/shared";
import { homePathForRole } from "./role-routes";

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
  return homePathForRole(role);
}

export function themeFor(role: Role) {
  return ROLE_THEME[role];
}

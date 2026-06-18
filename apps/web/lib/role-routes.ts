import { ROLES, type Role } from "@school-erp/shared";

export const roleHomePath: Record<Role, string> = {
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

export function homePathForRole(role: Role) {
  return roleHomePath[role];
}

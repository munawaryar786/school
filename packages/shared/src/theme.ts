import type { Role } from "./permissions";
import { ROLES } from "./permissions";

export const ROLE_THEME = {
  [ROLES.SUPER_ADMIN]: {
    name: "Super Admin",
    accent: "purple",
    className: "theme-super-admin"
  },
  [ROLES.SCHOOL_ADMIN]: {
    name: "School Admin",
    accent: "blue",
    className: "theme-school-admin"
  },
  [ROLES.TEACHER]: {
    name: "Teacher",
    accent: "green",
    className: "theme-teacher"
  },
  [ROLES.STUDENT]: {
    name: "Student",
    accent: "orange",
    className: "theme-student"
  },
  [ROLES.PARENT]: {
    name: "Parent",
    accent: "pink",
    className: "theme-parent"
  },
  [ROLES.STAFF]: {
    name: "Staff",
    accent: "blue",
    className: "theme-school-admin"
  },
  [ROLES.FINANCE_OFFICER]: {
    name: "Finance",
    accent: "blue",
    className: "theme-school-admin"
  },
  [ROLES.LIBRARIAN]: {
    name: "Library",
    accent: "teal",
    className: "theme-academic"
  },
  [ROLES.HR_OFFICER]: {
    name: "HR",
    accent: "blue",
    className: "theme-school-admin"
  }
} satisfies Record<Role, { name: string; accent: string; className: string }>;

export const MODULE_THEME = {
  academic: "teal",
  security: "dark-teal"
} as const;


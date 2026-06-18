import type { Role } from "./permissions";
import { ROLES } from "./permissions";

export const ROLE_THEME = {
  [ROLES.SUPER_ADMIN]: {
    name: "Super Admin",
    accent: "violet",
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
    accent: "rose",
    className: "theme-parent"
  },
  [ROLES.STAFF]: {
    name: "Staff",
    accent: "blue",
    className: "theme-school-admin"
  },
  [ROLES.FINANCE_OFFICER]: {
    name: "Finance",
    accent: "amber",
    className: "theme-finance"
  },
  [ROLES.LIBRARIAN]: {
    name: "Library",
    accent: "teal",
    className: "theme-library"
  },
  [ROLES.HR_OFFICER]: {
    name: "HR",
    accent: "warm-neutral",
    className: "theme-hr"
  }
} satisfies Record<Role, { name: string; accent: string; className: string }>;

export const MODULE_THEME = {
  academic: "teal",
  security: "dark-teal"
} as const;

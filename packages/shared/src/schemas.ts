import { z } from "zod";

export const schoolStatusSchema = z.enum(["ACTIVE", "TRIAL", "SUSPENDED", "ARCHIVED"]);
export const campusStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export const administratorStatusSchema = z.enum(["ACTIVE", "INVITED", "SUSPENDED"]);

export const superAdminListSortFieldSchema = z.enum(["name", "slug", "code", "status", "createdAt", "updatedAt", "email"]);
export const sortDirectionSchema = z.enum(["asc", "desc"]);

export const createSchoolSchema = z.object({
  name: z.string().trim().min(2, "School name must be at least 2 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .regex(/^[a-z0-9-]+$/, "Slug can use lowercase letters, numbers, and hyphens only."),
  status: schoolStatusSchema.default("TRIAL"),
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  website: z.string().trim().url("Enter a valid website URL.").optional().or(z.literal(""))
});

export const updateSchoolSchema = createSchoolSchema.partial();

export const campusSchema = z.object({
  schoolId: z.string().trim().min(1, "School is required."),
  name: z.string().trim().min(2, "Campus name must be at least 2 characters."),
  code: z
    .string()
    .trim()
    .min(2, "Campus code must be at least 2 characters.")
    .regex(/^[A-Z0-9-]+$/i, "Campus code can use letters, numbers, and hyphens only."),
  status: campusStatusSchema.default("ACTIVE"),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal(""))
});

export const updateCampusSchema = campusSchema.partial();

export const administratorSchema = z.object({
  schoolId: z.string().trim().min(1, "School is required."),
  name: z.string().trim().min(2, "Administrator name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").optional().or(z.literal("")),
  status: administratorStatusSchema.default("ACTIVE")
});

export const updateAdministratorSchema = administratorSchema.partial();

export const superAdminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  sortBy: superAdminListSortFieldSchema.default("createdAt"),
  sortDirection: sortDirectionSchema.default("desc"),
  format: z.enum(["json", "csv"]).default("json")
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type CampusInput = z.infer<typeof campusSchema>;
export type UpdateCampusInput = z.infer<typeof updateCampusSchema>;
export type AdministratorInput = z.infer<typeof administratorSchema>;
export type UpdateAdministratorInput = z.infer<typeof updateAdministratorSchema>;
export type SuperAdminListQuery = z.infer<typeof superAdminListQuerySchema>;

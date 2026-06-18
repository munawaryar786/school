import { z } from "zod";

export const schoolStatusSchema = z.enum(["ACTIVE", "TRIAL", "SUSPENDED", "ARCHIVED"]);

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

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;

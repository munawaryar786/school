import { z } from "zod";
import { roleSchema } from "./permissions";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  schoolId: z.string().optional(),
  twoFactorCode: z.string().trim().min(6).max(10).optional()
});

export type LoginInput = z.infer<typeof loginSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  activeRole: roleSchema,
  activeSchoolId: z.string().nullable(),
  permissions: z.array(z.string()),
  memberships: z.array(
    z.object({
      schoolId: z.string().nullable(),
      schoolName: z.string().nullable(),
      role: roleSchema
    })
  )
});

export type AuthUser = z.infer<typeof authUserSchema>;

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

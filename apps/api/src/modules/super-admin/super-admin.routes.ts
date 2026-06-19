import { Router } from "express";
import type { Request } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { administratorSchema, campusSchema, createSchoolSchema, PERMISSIONS, superAdminListQuerySchema, updateAdministratorSchema, updateCampusSchema, updateSchoolSchema } from "@school-erp/shared";
import { prisma } from "../../db/prisma";
import { ok, fail } from "../../http/responses";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { AuditService } from "../audit/audit.service";

const router = Router();
const audit = new AuditService(prisma);

const pageQuerySchema = superAdminListQuerySchema;
const schoolOrderFields = new Set(["name", "slug", "status", "createdAt", "updatedAt", "email"]);
const campusOrderFields = new Set(["name", "code", "status", "createdAt", "updatedAt", "email"]);
const membershipOrderFields = new Set(["status", "createdAt", "updatedAt"]);

const planSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  monthlyAmount: z.coerce.number().int().min(0),
  annualAmount: z.coerce.number().int().min(0),
  currency: z.string().trim().length(3).default("USD"),
  isActive: z.boolean().default(true)
});

const subscriptionSchema = z.object({
  schoolId: z.string().min(1),
  planId: z.string().min(1),
  status: z.enum(["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED"]).default("TRIAL"),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
  currentPeriodStart: z.coerce.date(),
  currentPeriodEnd: z.coerce.date(),
  amount: z.coerce.number().int().min(0),
  currency: z.string().trim().length(3).default("USD")
});

const userSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().default(true)
});

const settingSchema = z.object({
  key: z.string().trim().min(2).regex(/^[a-z0-9_.-]+$/),
  value: z.unknown(),
  description: z.string().trim().optional(),
  isSecret: z.boolean().default(false)
});

router.use(authenticate);

router.get("/overview", requirePermission(PERMISSIONS.SCHOOLS_READ), async (_req, res, next) => {
  try {
    const [schools, users, activeSubscriptions, revenue] = await Promise.all([
      prisma.school.count({ where: { deletedAt: null } }),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE" } })
    ]);
    return ok(res, {
      schools,
      users,
      activeSubscriptions,
      monthlyRecurringRevenue: revenue._sum.amount ?? 0
    });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard", requirePermission(PERMISSIONS.SCHOOLS_READ), async (_req, res, next) => {
  try {
    const [
      totalSchools,
      activeSchools,
      suspendedSchools,
      archivedSchools,
      totalCampuses,
      totalAdministrators,
      activeAdministrators,
      suspendedAdministrators,
      totalUsers,
      totalStudents,
      totalStaff,
      schoolsByStatus,
      usersByRole,
      recentAdministratorActivity
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.school.count({ where: { deletedAt: null, status: "SUSPENDED" } }),
      prisma.school.count({ where: { status: "ARCHIVED" } }),
      prisma.campus.count({ where: { school: { deletedAt: null } } }),
      prisma.schoolMembership.count({ where: { role: { code: "SCHOOL_ADMIN" }, schoolId: { not: null } } }),
      prisma.schoolMembership.count({ where: { role: { code: "SCHOOL_ADMIN" }, schoolId: { not: null }, status: "ACTIVE" } }),
      prisma.schoolMembership.count({ where: { role: { code: "SCHOOL_ADMIN" }, schoolId: { not: null }, status: "SUSPENDED" } }),
      prisma.user.count(),
      prisma.studentProfile.count(),
      prisma.schoolMembership.count({ where: { role: { code: { in: ["SCHOOL_ADMIN", "TEACHER", "STAFF", "FINANCE_OFFICER", "LIBRARIAN", "HR_OFFICER"] } } } }),
      prisma.school.groupBy({ by: ["status"], _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.schoolMembership.groupBy({ by: ["roleId"], _count: { _all: true }, orderBy: { roleId: "asc" } }),
      prisma.auditLog.findMany({
        where: { resource: { in: ["administrator", "school", "campus"] } },
        include: { user: { select: { name: true, email: true } }, school: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);
    const roleIds = usersByRole.map((item) => item.roleId);
    const roles = roleIds.length ? await prisma.role.findMany({ where: { id: { in: roleIds } } }) : [];
    const roleNameById = new Map(roles.map((role) => [role.id, role.code]));
    return ok(res, {
      metrics: {
        totalSchools,
        activeSchools,
        suspendedSchools,
        archivedSchools,
        totalCampuses,
        totalAdministrators,
        activeAdministrators,
        suspendedAdministrators,
        totalUsers,
        totalStudents,
        totalStaff
      },
      schoolsByStatus: schoolsByStatus.map((item) => ({ status: item.status, count: item._count._all })),
      usersByRole: usersByRole.map((item) => ({ role: roleNameById.get(item.roleId) ?? item.roleId, count: item._count._all })),
      recentAdministratorActivity: recentAdministratorActivity.map((item) => ({
        id: item.id,
        action: item.action,
        resource: item.resource,
        resourceId: item.resourceId,
        schoolName: item.school?.name ?? null,
        actorName: item.user?.name ?? null,
        actorEmail: item.user?.email ?? null,
        createdAt: item.createdAt
      })),
      lastUpdatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

router.get("/schools", requirePermission(PERMISSIONS.SCHOOLS_READ), async (req, res, next) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const schoolStatus = parseEnumFilter(["ACTIVE", "TRIAL", "SUSPENDED", "ARCHIVED"], query.status);
    const where: Prisma.SchoolWhereInput = {
      deletedAt: null,
      ...(schoolStatus ? { status: schoolStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { slug: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };
    const [rows, total] = await Promise.all([
      prisma.school.findMany({
        where,
        include: { subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: schoolOrderBy(query, schoolOrderFields),
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.school.count({ where })
    ]);
    if (query.format === "csv") {
      return csv(res, "schools.csv", rows.map((school) => ({
        id: school.id,
        name: school.name,
        slug: school.slug,
        status: school.status,
        email: school.email ?? "",
        phone: school.phone ?? ""
      })));
    }
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.get("/schools/:id", requirePermission(PERMISSIONS.SCHOOLS_READ), async (req, res, next) => {
  try {
    const schoolId = routeId(req);
    const school = await prisma.school.findFirst({
      where: { id: schoolId, deletedAt: null },
      include: {
        campuses: { orderBy: { createdAt: "desc" } },
        subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 3 }
      }
    });
    if (!school) return fail(res, 404, "NOT_FOUND", "School not found.");
    const [
      schoolAdmins,
      usersByRole,
      teacherCount,
      studentCount,
      libraryBookCount,
      recentActivity
    ] = await Promise.all([
      prisma.schoolMembership.findMany({
        where: { schoolId, role: { code: "SCHOOL_ADMIN" } },
        include: { user: { select: { id: true, name: true, email: true, isActive: true } }, role: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.schoolMembership.groupBy({ by: ["roleId"], where: { schoolId }, _count: { _all: true }, orderBy: { roleId: "asc" } }),
      prisma.teacherProfile.count({ where: { schoolId } }),
      prisma.studentProfile.count({ where: { schoolId } }),
      prisma.libraryBook.count({ where: { schoolId } }),
      prisma.auditLog.findMany({
        where: { schoolId },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);
    const roleIds = usersByRole.map((item) => item.roleId);
    const roles = roleIds.length ? await prisma.role.findMany({ where: { id: { in: roleIds } } }) : [];
    const roleNameById = new Map(roles.map((role) => [role.id, role.code]));
    const roleCounts = usersByRole.map((item) => ({ role: roleNameById.get(item.roleId) ?? item.roleId, count: item._count._all }));
    return ok(res, {
      ...school,
      schoolAdmins: schoolAdmins.map((item) => ({
        id: item.id,
        userId: item.userId,
        name: item.user.name,
        email: item.user.email,
        status: item.status,
        isActive: item.user.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      counts: {
        campuses: school.campuses.length,
        users: roleCounts.reduce((sum, item) => sum + item.count, 0),
        teachers: teacherCount,
        students: studentCount,
        parents: roleCounts.find((item) => item.role === "PARENT")?.count ?? 0,
        libraryBooks: libraryBookCount,
        administrators: schoolAdmins.length
      },
      usersByRole: roleCounts,
      recentActivity: recentActivity.map((item) => ({
        id: item.id,
        action: item.action,
        resource: item.resource,
        resourceId: item.resourceId,
        actorName: item.user?.name ?? null,
        actorEmail: item.user?.email ?? null,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post("/schools", requirePermission(PERMISSIONS.SCHOOLS_CREATE), async (req, res, next) => {
  try {
    const data = normalizeCreateSchool(createSchoolSchema.parse(req.body));
    const school = await prisma.school.create({ data });
    await writeAudit(req, "CREATE", "school", school.id, { name: school.name });
    return ok(res, school, 201);
  } catch (error) {
    if (isUniqueError(error)) return fail(res, 409, "CONFLICT", "School slug already exists.");
    next(error);
  }
});

router.patch("/schools/:id", requirePermission(PERMISSIONS.SCHOOLS_UPDATE), async (req, res, next) => {
  try {
    const data = normalizeUpdateSchool(updateSchoolSchema.parse(req.body));
    const school = await prisma.school.update({ where: { id: routeId(req) }, data });
    await writeAudit(req, "UPDATE", "school", school.id, data);
    return ok(res, school);
  } catch (error) {
    next(error);
  }
});

router.delete("/schools/:id", requirePermission(PERMISSIONS.SCHOOLS_DELETE), async (req, res, next) => {
  try {
    const school = await prisma.school.update({ where: { id: routeId(req) }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
    await writeAudit(req, "DELETE", "school", school.id, { name: school.name });
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.post("/schools/:id/activate", requirePermission(PERMISSIONS.SCHOOLS_UPDATE), async (req, res, next) => {
  try {
    const school = await prisma.school.update({ where: { id: routeId(req) }, data: { status: "ACTIVE", deletedAt: null } });
    await writeAudit(req, "UPDATE", "school", school.id, { status: "ACTIVE" });
    return ok(res, school);
  } catch (error) {
    next(error);
  }
});

router.post("/schools/:id/suspend", requirePermission(PERMISSIONS.SCHOOLS_UPDATE), async (req, res, next) => {
  try {
    const school = await prisma.school.update({ where: { id: routeId(req) }, data: { status: "SUSPENDED" } });
    await writeAudit(req, "UPDATE", "school", school.id, { status: "SUSPENDED" });
    return ok(res, school);
  } catch (error) {
    next(error);
  }
});

router.get("/campuses", requirePermission(PERMISSIONS.SCHOOLS_READ), async (req, res, next) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const campusStatus = parseEnumFilter(["ACTIVE", "INACTIVE", "ARCHIVED"], query.status);
    const where: Prisma.CampusWhereInput = {
      school: { deletedAt: null },
      ...(campusStatus ? { status: campusStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
              { school: { name: { contains: query.search, mode: "insensitive" } } }
            ]
          }
        : {})
    };
    const [rows, total] = await Promise.all([
      prisma.campus.findMany({
        where,
        include: { school: { select: { name: true, slug: true, status: true } } },
        orderBy: schoolOrderBy(query, campusOrderFields),
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.campus.count({ where })
    ]);
    const data = rows.map((campus) => ({ ...campus, schoolName: campus.school.name, schoolSlug: campus.school.slug }));
    if (query.format === "csv") return csv(res, "campuses.csv", data);
    return paginated(res, data, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.get("/campuses/:id", requirePermission(PERMISSIONS.SCHOOLS_READ), async (req, res, next) => {
  try {
    const campus = await prisma.campus.findUnique({ where: { id: routeId(req) }, include: { school: { select: { name: true, slug: true, status: true } } } });
    if (!campus) return fail(res, 404, "NOT_FOUND", "Campus not found.");
    return ok(res, { ...campus, schoolName: campus.school.name, schoolSlug: campus.school.slug });
  } catch (error) {
    next(error);
  }
});

router.post("/campuses", requirePermission(PERMISSIONS.SCHOOLS_CREATE), async (req, res, next) => {
  try {
    const parsed = campusSchema.parse(req.body);
    const input = {
      ...parsed,
      code: parsed.code.toUpperCase(),
      email: parsed.email || null
    };
    const school = await prisma.school.findFirst({ where: { id: input.schoolId, deletedAt: null } });
    if (!school) return fail(res, 404, "NOT_FOUND", "School not found.");
    const campus = await prisma.campus.create({ data: input });
    await writeAudit(req, "CREATE", "campus", campus.id, { schoolId: campus.schoolId, name: campus.name });
    return ok(res, campus, 201);
  } catch (error) {
    if (isUniqueError(error)) return fail(res, 409, "CONFLICT", "Campus code already exists for this school.");
    next(error);
  }
});

router.patch("/campuses/:id", requirePermission(PERMISSIONS.SCHOOLS_UPDATE), async (req, res, next) => {
  try {
    const parsed = updateCampusSchema.parse(req.body);
    const input = {
      ...parsed,
      ...(parsed.code ? { code: parsed.code.toUpperCase() } : {}),
      ...(parsed.email !== undefined ? { email: parsed.email || null } : {})
    };
    if (input.schoolId) {
      const school = await prisma.school.findFirst({ where: { id: input.schoolId, deletedAt: null } });
      if (!school) return fail(res, 404, "NOT_FOUND", "School not found.");
    }
    const campus = await prisma.campus.update({ where: { id: routeId(req) }, data: input });
    await writeAudit(req, "UPDATE", "campus", campus.id, input);
    return ok(res, campus);
  } catch (error) {
    if (isUniqueError(error)) return fail(res, 409, "CONFLICT", "Campus code already exists for this school.");
    next(error);
  }
});

router.delete("/campuses/:id", requirePermission(PERMISSIONS.SCHOOLS_DELETE), async (req, res, next) => {
  try {
    const campus = await prisma.campus.update({ where: { id: routeId(req) }, data: { status: "ARCHIVED" } });
    await writeAudit(req, "DELETE", "campus", campus.id, { name: campus.name, schoolId: campus.schoolId });
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.get("/administrators", requirePermission(PERMISSIONS.ADMINS_MANAGE), async (req, res, next) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const schoolRole = await prisma.role.findUniqueOrThrow({ where: { code: "SCHOOL_ADMIN" } });
    const adminStatus = parseEnumFilter(["ACTIVE", "INVITED", "SUSPENDED"], query.status);
    const schoolId = typeof req.query.schoolId === "string" && req.query.schoolId.trim() ? req.query.schoolId.trim() : undefined;
    const where: Prisma.SchoolMembershipWhereInput = {
      roleId: schoolRole.id,
      ...(schoolId ? { schoolId } : {}),
      ...(adminStatus ? { status: adminStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { user: { name: { contains: query.search, mode: "insensitive" } } },
              { user: { email: { contains: query.search, mode: "insensitive" } } },
              { school: { name: { contains: query.search, mode: "insensitive" } } }
            ]
          }
        : {})
    };
    const [rows, total] = await Promise.all([
      prisma.schoolMembership.findMany({
        where,
        include: { user: true, school: true, role: true },
        orderBy: membershipOrderBy(query),
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.schoolMembership.count({ where })
    ]);
    const data = rows.map((item) => ({
      id: item.id,
      userId: item.userId,
      schoolId: item.schoolId,
      name: item.user.name,
      email: item.user.email,
      schoolName: item.school?.name ?? "Platform",
      status: item.status,
      isActive: item.user.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    if (query.format === "csv") return csv(res, "administrators.csv", data);
    return paginated(res, data, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.get("/administrators/:id", requirePermission(PERMISSIONS.ADMINS_MANAGE), async (req, res, next) => {
  try {
    const membership = await prisma.schoolMembership.findUnique({
      where: { id: routeId(req) },
      include: { user: { select: { id: true, name: true, email: true, isActive: true } }, school: { select: { id: true, name: true, slug: true } }, role: true }
    });
    if (!membership || membership.role.code !== "SCHOOL_ADMIN") return fail(res, 404, "NOT_FOUND", "Administrator not found.");
    return ok(res, {
      id: membership.id,
      userId: membership.userId,
      schoolId: membership.schoolId,
      name: membership.user.name,
      email: membership.user.email,
      schoolName: membership.school?.name ?? "Platform",
      schoolSlug: membership.school?.slug ?? null,
      status: membership.status,
      isActive: membership.user.isActive,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

router.post("/administrators", requirePermission(PERMISSIONS.ADMINS_MANAGE), async (req, res, next) => {
  try {
    const input = administratorSchema.parse(req.body);
    const school = await prisma.school.findFirst({ where: { id: input.schoolId, deletedAt: null } });
    if (!school) return fail(res, 404, "NOT_FOUND", "School not found.");
    const passwordHash = await bcrypt.hash(input.password ?? "Password123!", 12);
    const role = await prisma.role.findUniqueOrThrow({ where: { code: "SCHOOL_ADMIN" } });
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: input.email.toLowerCase() },
        update: { name: input.name, isActive: input.status === "ACTIVE", ...(input.password ? { passwordHash } : {}) },
        create: { email: input.email.toLowerCase(), name: input.name, passwordHash, isActive: input.status === "ACTIVE" }
      });
      const existing = await tx.schoolMembership.findFirst({ where: { userId: user.id, schoolId: input.schoolId, roleId: role.id } });
      const membership = existing
        ? await tx.schoolMembership.update({ where: { id: existing.id }, data: { status: input.status } })
        : await tx.schoolMembership.create({ data: { userId: user.id, schoolId: input.schoolId, roleId: role.id, status: input.status } });
      return { user, membership };
    });
    await writeAudit(req, "CREATE", "administrator", result.membership.id, { email: input.email, schoolId: input.schoolId });
    return ok(res, result, 201);
  } catch (error) {
    next(error);
  }
});

router.patch("/administrators/:id", requirePermission(PERMISSIONS.ADMINS_MANAGE), async (req, res, next) => {
  try {
    const input = updateAdministratorSchema.parse(req.body);
    if (input.schoolId) {
      const school = await prisma.school.findFirst({ where: { id: input.schoolId, deletedAt: null } });
      if (!school) return fail(res, 404, "NOT_FOUND", "School not found.");
    }
    const membership = await prisma.schoolMembership.update({ where: { id: routeId(req) }, data: { ...(input.schoolId ? { schoolId: input.schoolId } : {}), ...(input.status ? { status: input.status } : {}) } });
    if (input.name || input.email || input.password) {
      await prisma.user.update({
        where: { id: membership.userId },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.email ? { email: input.email.toLowerCase() } : {}),
          ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 12) } : {}),
          ...(input.status ? { isActive: input.status === "ACTIVE" } : {})
        }
      });
    }
    await writeAudit(req, "UPDATE", "administrator", membership.id, input);
    return ok(res, { updated: true });
  } catch (error) {
    next(error);
  }
});

router.delete("/administrators/:id", requirePermission(PERMISSIONS.ADMINS_MANAGE), async (req, res, next) => {
  try {
    const membership = await prisma.schoolMembership.update({ where: { id: routeId(req) }, data: { status: "SUSPENDED" } });
    await writeAudit(req, "DELETE", "administrator", membership.id, {});
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.post("/administrators/:id/suspend", requirePermission(PERMISSIONS.ADMINS_MANAGE), async (req, res, next) => {
  try {
    const membership = await prisma.schoolMembership.update({ where: { id: routeId(req) }, data: { status: "SUSPENDED" } });
    await prisma.user.update({ where: { id: membership.userId }, data: { isActive: false } });
    await writeAudit(req, "UPDATE", "administrator", membership.id, { status: "SUSPENDED" });
    return ok(res, { updated: true });
  } catch (error) {
    next(error);
  }
});

router.post("/administrators/:id/activate", requirePermission(PERMISSIONS.ADMINS_MANAGE), async (req, res, next) => {
  try {
    const membership = await prisma.schoolMembership.update({ where: { id: routeId(req) }, data: { status: "ACTIVE" } });
    await prisma.user.update({ where: { id: membership.userId }, data: { isActive: true } });
    await writeAudit(req, "UPDATE", "administrator", membership.id, { status: "ACTIVE" });
    return ok(res, { updated: true });
  } catch (error) {
    next(error);
  }
});

router.get("/plans", requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE), async (_req, res, next) => {
  try {
    return ok(res, await prisma.subscriptionPlan.findMany({ orderBy: { monthlyAmount: "asc" } }));
  } catch (error) {
    next(error);
  }
});

router.post("/plans", requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE), async (req, res, next) => {
  try {
    const plan = await prisma.subscriptionPlan.create({ data: planSchema.parse(req.body) });
    await writeAudit(req, "CREATE", "subscriptionPlan", plan.id, { name: plan.name });
    return ok(res, plan, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/subscriptions", requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE), async (req, res, next) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const where: Prisma.SubscriptionWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.search
        ? {
            OR: [
              { school: { name: { contains: query.search, mode: "insensitive" } } },
              { plan: { name: { contains: query.search, mode: "insensitive" } } }
            ]
          }
        : {})
    };
    const [rows, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: { school: true, plan: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.subscription.count({ where })
    ]);
    const data = rows.map((item) => ({ ...item, schoolName: item.school.name, planName: item.plan.name }));
    if (query.format === "csv") return csv(res, "subscriptions.csv", data);
    return paginated(res, data, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/subscriptions", requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE), async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.create({ data: subscriptionSchema.parse(req.body) });
    await writeAudit(req, "CREATE", "subscription", subscription.id, { schoolId: subscription.schoolId });
    return ok(res, subscription, 201);
  } catch (error) {
    next(error);
  }
});

router.patch("/subscriptions/:id", requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE), async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.update({ where: { id: routeId(req) }, data: subscriptionSchema.partial().parse(req.body) });
    await writeAudit(req, "UPDATE", "subscription", subscription.id, {});
    return ok(res, subscription);
  } catch (error) {
    next(error);
  }
});

router.delete("/subscriptions/:id", requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE), async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.update({ where: { id: routeId(req) }, data: { status: "CANCELLED" } });
    await writeAudit(req, "DELETE", "subscription", subscription.id, {});
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.get("/revenue", requirePermission(PERMISSIONS.REVENUE_READ), async (req, res, next) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const rows = await prisma.subscription.findMany({ include: { school: true, plan: true }, orderBy: { currentPeriodStart: "desc" } });
    const filtered = query.search ? rows.filter((row) => `${row.school.name} ${row.plan.name}`.toLowerCase().includes(query.search!.toLowerCase())) : rows;
    const data = filtered.map((row) => ({
      id: row.id,
      schoolName: row.school.name,
      planName: row.plan.name,
      status: row.status,
      amount: row.amount,
      currency: row.currency,
      periodStart: row.currentPeriodStart.toISOString(),
      periodEnd: row.currentPeriodEnd.toISOString()
    }));
    if (query.format === "csv") return csv(res, "revenue.csv", data);
    return paginated(res, data.slice((query.page - 1) * query.pageSize, query.page * query.pageSize), query.page, query.pageSize, data.length);
  } catch (error) {
    next(error);
  }
});

router.get("/users", requirePermission(PERMISSIONS.USERS_MANAGE), async (req, res, next) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const where: Prisma.UserWhereInput = {
      ...(query.status ? { isActive: query.status === "ACTIVE" } : {}),
      ...(query.search
        ? { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { email: { contains: query.search, mode: "insensitive" } }] }
        : {})
    };
    const [rows, total] = await Promise.all([
      prisma.user.findMany({ where, include: { memberships: { include: { role: true, school: true } } }, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.user.count({ where })
    ]);
    const data = rows.map((user) => ({ id: user.id, name: user.name, email: user.email, isActive: user.isActive, roles: user.memberships.map((m) => m.role.code).join(", ") }));
    if (query.format === "csv") return csv(res, "users.csv", data);
    return paginated(res, data, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/users", requirePermission(PERMISSIONS.USERS_MANAGE), async (req, res, next) => {
  try {
    const input = userSchema.required({ password: true }).parse(req.body);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email.toLowerCase(), isActive: input.isActive, passwordHash: await bcrypt.hash(input.password, 12) }
    });
    await writeAudit(req, "CREATE", "user", user.id, { email: user.email });
    return ok(res, user, 201);
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id", requirePermission(PERMISSIONS.USERS_MANAGE), async (req, res, next) => {
  try {
    const input = userSchema.partial().parse(req.body);
    const user = await prisma.user.update({
      where: { id: routeId(req) },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.email ? { email: input.email.toLowerCase() } : {}),
        ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 12) } : {}),
        ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {})
      }
    });
    await writeAudit(req, "UPDATE", "user", user.id, { email: user.email });
    return ok(res, user);
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", requirePermission(PERMISSIONS.USERS_MANAGE), async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: routeId(req) }, data: { isActive: false } });
    await writeAudit(req, "DELETE", "user", user.id, { email: user.email });
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.get("/audit-logs", requirePermission(PERMISSIONS.AUDIT_READ), async (req, res, next) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const where: Prisma.AuditLogWhereInput = query.search
      ? { OR: [{ resource: { contains: query.search, mode: "insensitive" } }, { resourceId: { contains: query.search, mode: "insensitive" } }] }
      : {};
    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({ where, include: { user: { select: { email: true, name: true } }, school: { select: { name: true } } }, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.auditLog.count({ where })
    ]);
    if (query.format === "csv") return csv(res, "audit-logs.csv", rows);
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.get("/settings", requirePermission(PERMISSIONS.SYSTEM_SETTINGS_MANAGE), async (_req, res, next) => {
  try {
    return ok(res, await prisma.systemSetting.findMany({ orderBy: { key: "asc" } }));
  } catch (error) {
    next(error);
  }
});

router.post("/settings", requirePermission(PERMISSIONS.SYSTEM_SETTINGS_MANAGE), async (req, res, next) => {
  try {
    const input = settingSchema.parse(req.body);
    const setting = await prisma.systemSetting.upsert({
      where: { key: input.key },
      update: { value: input.value as Prisma.InputJsonValue, description: input.description, isSecret: input.isSecret, updatedById: req.auth!.userId },
      create: { key: input.key, value: input.value as Prisma.InputJsonValue, description: input.description, isSecret: input.isSecret, updatedById: req.auth!.userId }
    });
    await writeAudit(req, "SETTINGS_UPDATE", "systemSetting", setting.id, { key: setting.key });
    return ok(res, setting);
  } catch (error) {
    next(error);
  }
});

router.post("/backups", requirePermission(PERMISSIONS.BACKUPS_MANAGE), async (req, res, next) => {
  try {
    const backupDir = path.resolve(".data/backups");
    await fs.mkdir(backupDir, { recursive: true });
    const snapshot = {
      generatedAt: new Date().toISOString(),
      schools: await prisma.school.findMany(),
      users: await prisma.user.findMany(),
      memberships: await prisma.schoolMembership.findMany(),
      plans: await prisma.subscriptionPlan.findMany(),
      subscriptions: await prisma.subscription.findMany(),
      settings: await prisma.systemSetting.findMany()
    };
    const content = JSON.stringify(snapshot, null, 2);
    const checksum = crypto.createHash("sha256").update(content).digest("hex");
    const filePath = path.join(backupDir, `backup-${Date.now()}.json`);
    await fs.writeFile(filePath, content, "utf8");
    const backup = await prisma.backupJob.create({
      data: { filePath, fileSize: Buffer.byteLength(content), checksum, createdById: req.auth!.userId, metadata: { counts: Object.fromEntries(Object.entries(snapshot).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, (value as unknown[]).length])) } }
    });
    await writeAudit(req, "BACKUP", "backupJob", backup.id, { filePath });
    return ok(res, backup, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/backups", requirePermission(PERMISSIONS.BACKUPS_MANAGE), async (_req, res, next) => {
  try {
    return ok(res, await prisma.backupJob.findMany({ orderBy: { createdAt: "desc" } }));
  } catch (error) {
    next(error);
  }
});

router.post("/backups/:id/restore", requirePermission(PERMISSIONS.BACKUPS_MANAGE), async (req, res, next) => {
  try {
    const backup = await prisma.backupJob.findUniqueOrThrow({ where: { id: routeId(req) } });
    const snapshot = JSON.parse(await fs.readFile(backup.filePath, "utf8")) as {
      schools: Array<Prisma.SchoolCreateInput & { id: string }>;
      plans: Array<Prisma.SubscriptionPlanCreateInput & { id: string }>;
      settings: Array<{ key: string; value: Prisma.InputJsonValue; description?: string | null; isSecret: boolean }>;
    };
    await prisma.$transaction(async (tx) => {
      for (const school of snapshot.schools ?? []) {
        await tx.school.upsert({
          where: { id: school.id },
          update: { name: school.name, slug: school.slug, status: school.status, email: school.email, phone: school.phone, address: school.address, website: school.website, deletedAt: school.deletedAt },
          create: { id: school.id, name: school.name, slug: school.slug, status: school.status, email: school.email, phone: school.phone, address: school.address, website: school.website, deletedAt: school.deletedAt }
        });
      }
      for (const plan of snapshot.plans ?? []) {
        await tx.subscriptionPlan.upsert({
          where: { id: plan.id },
          update: { name: plan.name, description: plan.description, monthlyAmount: plan.monthlyAmount, annualAmount: plan.annualAmount, currency: plan.currency, isActive: plan.isActive },
          create: { id: plan.id, name: plan.name, description: plan.description, monthlyAmount: plan.monthlyAmount, annualAmount: plan.annualAmount, currency: plan.currency, isActive: plan.isActive }
        });
      }
      for (const setting of snapshot.settings ?? []) {
        await tx.systemSetting.upsert({ where: { key: setting.key }, update: setting, create: setting });
      }
      await tx.backupJob.update({ where: { id: backup.id }, data: { status: "RESTORED", restoredAt: new Date() } });
    });
    await writeAudit(req, "RESTORE", "backupJob", backup.id, {});
    return ok(res, { restored: true });
  } catch (error) {
    next(error);
  }
});

function normalizeCreateSchool<T extends { email?: string; website?: string }>(data: T) {
  return {
    ...data,
    email: data.email || null,
    website: data.website || null
  };
}

function normalizeUpdateSchool<T extends { email?: string; website?: string }>(data: T) {
  return {
    ...data,
    ...(data.email !== undefined ? { email: data.email || null } : {}),
    ...(data.website !== undefined ? { website: data.website || null } : {})
  };
}

function schoolOrderBy(query: z.infer<typeof pageQuerySchema>, allowed: Set<string>) {
  const sortBy = allowed.has(query.sortBy) ? query.sortBy : "createdAt";
  return { [sortBy]: query.sortDirection } as Record<string, "asc" | "desc">;
}

function membershipOrderBy(query: z.infer<typeof pageQuerySchema>) {
  if (membershipOrderFields.has(query.sortBy)) {
    return { [query.sortBy]: query.sortDirection } as Record<string, "asc" | "desc">;
  }
  if (query.sortBy === "name") return { user: { name: query.sortDirection } } as const;
  if (query.sortBy === "email") return { user: { email: query.sortDirection } } as const;
  return { createdAt: "desc" } as const;
}

function parseEnumFilter<T extends string>(allowed: readonly T[], value?: string) {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

function paginated<T>(res: Parameters<typeof ok<T[]>>[0], data: T[], page: number, pageSize: number, total: number) {
  return res.json({
    success: true,
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    meta: { requestId: res.locals.requestId }
  });
}

function csv(res: Parameters<typeof ok>[0], filename: string, rows: Array<Record<string, unknown>>) {
  const headers = Object.keys(rows[0] ?? { empty: "" });
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
  res.setHeader("content-type", "text/csv; charset=utf-8");
  res.setHeader("content-disposition", `attachment; filename="${filename}"`);
  return res.send(body);
}

function escapeCsv(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function isUniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function routeId(req: Request) {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({
    userId: req.auth?.userId,
    schoolId: req.auth?.schoolId,
    action,
    resource,
    resourceId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.header("user-agent")
  });
}

export { router as superAdminRoutes };

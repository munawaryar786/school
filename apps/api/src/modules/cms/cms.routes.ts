import { Router } from "express";
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PERMISSIONS } from "@school-erp/shared";
import { prisma } from "../../db/prisma";
import { ok, fail } from "../../http/responses";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { AuditService } from "../audit/audit.service";

const router = Router();
const audit = new AuditService(prisma);

const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  format: z.enum(["json", "csv"]).default("json")
});

const schemas = {
  pages: z.object({ title: z.string().min(2), slug: z.string().min(2), pageType: z.string().min(2).default("GENERAL"), heroTitle: z.string().min(2), heroImageUrl: z.string().optional(), content: z.string().min(2), publishedAt: z.coerce.date().optional(), status: z.string().default("DRAFT") }),
  blogs: z.object({ title: z.string().min(2), slug: z.string().min(2), authorName: z.string().min(2), category: z.string().min(2), excerpt: z.string().min(2), content: z.string().min(2), coverImageUrl: z.string().optional(), publishedAt: z.coerce.date().optional(), status: z.string().default("DRAFT") }),
  news: z.object({ title: z.string().min(2), slug: z.string().min(2), summary: z.string().min(2), body: z.string().min(2), publishedOn: z.coerce.date(), status: z.string().default("PUBLISHED") }),
  announcements: z.object({ title: z.string().min(2), audience: z.string().min(2), message: z.string().min(2), startsOn: z.coerce.date(), endsOn: z.coerce.date().optional(), status: z.string().default("PUBLISHED") }),
  admissions: z.object({ title: z.string().min(2), slug: z.string().min(2), programName: z.string().min(2), intakeYear: z.string().min(2), requirements: z.string().min(2), content: z.string().min(2), ctaLabel: z.string().min(2), ctaUrl: z.string().min(1), status: z.string().default("DRAFT") })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  pages: "websitePage",
  blogs: "blogPost",
  news: "newsItem",
  announcements: "websiteAnnouncement",
  admissions: "cmsAdmissionPage"
};

const columnsByResource: Record<Resource, string[]> = {
  pages: ["id", "title", "slug", "pageType", "heroTitle", "heroImageUrl", "content", "publishedAt", "status"],
  blogs: ["id", "title", "slug", "authorName", "category", "excerpt", "content", "coverImageUrl", "publishedAt", "status"],
  news: ["id", "title", "slug", "summary", "body", "publishedOn", "status"],
  announcements: ["id", "title", "audience", "message", "startsOn", "endsOn", "status"],
  admissions: ["id", "title", "slug", "programName", "intakeYear", "requirements", "content", "ctaLabel", "ctaUrl", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.CMS_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [pages, blogs, news, announcements, admissions, published, drafts] = await Promise.all([
      prisma.websitePage.count({ where: { schoolId } }),
      prisma.blogPost.count({ where: { schoolId } }),
      prisma.newsItem.count({ where: { schoolId } }),
      prisma.websiteAnnouncement.count({ where: { schoolId } }),
      prisma.cmsAdmissionPage.count({ where: { schoolId } }),
      Promise.all([
        prisma.websitePage.count({ where: { schoolId, status: "PUBLISHED" } }),
        prisma.blogPost.count({ where: { schoolId, status: "PUBLISHED" } }),
        prisma.newsItem.count({ where: { schoolId, status: "PUBLISHED" } }),
        prisma.websiteAnnouncement.count({ where: { schoolId, status: "PUBLISHED" } }),
        prisma.cmsAdmissionPage.count({ where: { schoolId, status: "PUBLISHED" } })
      ]).then((counts) => counts.reduce((total, count) => total + count, 0)),
      Promise.all([
        prisma.websitePage.count({ where: { schoolId, status: "DRAFT" } }),
        prisma.blogPost.count({ where: { schoolId, status: "DRAFT" } }),
        prisma.cmsAdmissionPage.count({ where: { schoolId, status: "DRAFT" } })
      ]).then((counts) => counts.reduce((total, count) => total + count, 0))
    ]);
    return ok(res, { pages, blogs, news, announcements, admissions, published, drafts });
  } catch (error) {
    next(error);
  }
});

router.get("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const query = pageQuerySchema.parse(req.query);
    const delegate = prisma[modelByResource[resource]] as any;
    const where = buildWhere(resource, schoolId, query.search, query.status);
    const [rows, total] = await Promise.all([
      delegate.findMany({ where, orderBy: orderByFor(resource), skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      delegate.count({ where })
    ]);
    if (query.format === "csv") {
      await writeAudit(req, "EXPORT", resource, "csv", { search: query.search, status: query.status });
      return csv(res, `${resource}.csv`, rows, columnsByResource[resource]);
    }
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const delegate = prisma[modelByResource[resource]] as any;
    const data = schemas[resource].parse(req.body);
    const row = await delegate.create({ data: { ...data, schoolId } });
    await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "CMS record could not be saved.");
    next(error);
  }
});

router.patch("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const delegate = prisma[modelByResource[resource]] as any;
    const data = schemas[resource].partial().parse(req.body);
    await ensureOwnRecord(delegate, routeId(req), schoolId);
    const row = await delegate.update({ where: { id: routeId(req) }, data });
    await writeAudit(req, "UPDATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row);
  } catch (error) {
    next(error);
  }
});

router.delete("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const delegate = prisma[modelByResource[resource]] as any;
    await ensureOwnRecord(delegate, routeId(req), schoolId);
    const row = await delegate.delete({ where: { id: routeId(req) } });
    await writeAudit(req, "DELETE", resource, row.id, {});
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!resource || !(resource in schemas)) {
    fail(res, 404, "NOT_FOUND", "CMS resource not found.");
    return null;
  }
  return resource;
}

function requireSchool(req: Request, res: Response) {
  if (!req.auth?.schoolId) {
    fail(res, 403, "TENANT_REQUIRED", "A school context is required.");
    return null;
  }
  return req.auth.schoolId;
}

function buildWhere(resource: Resource, schoolId: string, search?: string, status?: string) {
  const where: any = { schoolId };
  if (status) where.status = status;
  if (!search) return where;
  const searchFields: Record<Resource, string[]> = {
    pages: ["title", "slug", "pageType", "heroTitle", "content"],
    blogs: ["title", "slug", "authorName", "category", "excerpt", "content"],
    news: ["title", "slug", "summary", "body"],
    announcements: ["title", "audience", "message"],
    admissions: ["title", "slug", "programName", "intakeYear", "requirements", "content"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "news") return { publishedOn: "desc" };
  if (resource === "announcements") return { startsOn: "desc" };
  return { createdAt: "desc" };
}

async function ensureOwnRecord(delegate: any, id: string, schoolId: string) {
  const found = await delegate.findFirst({ where: { id, schoolId } });
  if (!found) {
    throw Object.assign(new Error("Record not found."), { statusCode: 404 });
  }
}

function paginated<T>(res: Response, data: T[], page: number, pageSize: number, total: number) {
  return res.json({ success: true, data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }, meta: { requestId: res.locals.requestId } });
}

function csv(res: Response, filename: string, rows: Array<Record<string, unknown>>, headers: string[]) {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
  res.setHeader("content-type", "text/csv; charset=utf-8");
  res.setHeader("content-disposition", `attachment; filename="${filename}"`);
  return res.send(body);
}

function escapeCsv(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function routeId(req: Request) {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function isPrismaError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as cmsRoutes };

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
  performance: z.object({ area: z.string().min(2), metric: z.string().min(2), value: z.coerce.number().int().min(0), unit: z.string().min(1), threshold: z.coerce.number().int().min(0), status: z.string().default("PASS"), checkedAt: z.coerce.date().optional(), notes: z.string().optional() }),
  accessibility: z.object({ page: z.string().min(1), rule: z.string().min(2), impact: z.string().min(2), status: z.string().default("PASS"), checkedAt: z.coerce.date().optional(), notes: z.string().optional() }),
  seo: z.object({ page: z.string().min(1), title: z.string().min(2), description: z.string().min(2), canonical: z.string().optional(), status: z.string().default("PASS"), checkedAt: z.coerce.date().optional(), notes: z.string().optional() }),
  errors: z.object({ source: z.string().min(2), severity: z.string().default("ERROR"), message: z.string().min(2), stack: z.string().optional(), status: z.string().default("OPEN"), occurredAt: z.coerce.date().optional() }),
  deployment: z.object({ environment: z.string().min(2), checkName: z.string().min(2), status: z.string().default("PASS"), checkedAt: z.coerce.date().optional(), notes: z.string().optional() }),
  load: z.object({ scenario: z.string().min(2), virtualUsers: z.coerce.number().int().min(1), durationSeconds: z.coerce.number().int().min(1), requestsPerSecond: z.coerce.number().int().min(0), p95Ms: z.coerce.number().int().min(0), errorRate: z.coerce.number().int().min(0), status: z.string().default("PASS"), testedAt: z.coerce.date().optional(), notes: z.string().optional() }),
  regression: z.object({ suite: z.string().min(2), checkName: z.string().min(2), status: z.string().default("PASS"), checkedAt: z.coerce.date().optional(), notes: z.string().optional() })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  performance: "performanceCheck",
  accessibility: "accessibilityAudit",
  seo: "seoCheck",
  errors: "errorMonitoringEvent",
  deployment: "deploymentCheck",
  load: "loadTestResult",
  regression: "regressionCheck"
};

const columnsByResource: Record<Resource, string[]> = {
  performance: ["id", "area", "metric", "value", "unit", "threshold", "status", "checkedAt", "notes"],
  accessibility: ["id", "page", "rule", "impact", "status", "checkedAt", "notes"],
  seo: ["id", "page", "title", "description", "canonical", "status", "checkedAt", "notes"],
  errors: ["id", "source", "severity", "message", "status", "occurredAt"],
  deployment: ["id", "environment", "checkName", "status", "checkedAt", "notes"],
  load: ["id", "scenario", "virtualUsers", "durationSeconds", "requestsPerSecond", "p95Ms", "errorRate", "status", "testedAt", "notes"],
  regression: ["id", "suite", "checkName", "status", "checkedAt", "notes"]
};

router.use(authenticate, requirePermission(PERMISSIONS.PRODUCTION_READINESS_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = scopeSchool(req);
    const [performance, accessibility, seo, errors, deployment, load, regression, failing, openErrors] = await Promise.all([
      prisma.performanceCheck.count({ where: { schoolId } }),
      prisma.accessibilityAudit.count({ where: { schoolId } }),
      prisma.seoCheck.count({ where: { schoolId } }),
      prisma.errorMonitoringEvent.count({ where: { schoolId } }),
      prisma.deploymentCheck.count({ where: { schoolId } }),
      prisma.loadTestResult.count({ where: { schoolId } }),
      prisma.regressionCheck.count({ where: { schoolId } }),
      Promise.all([
        prisma.performanceCheck.count({ where: { schoolId, status: { not: "PASS" } } }),
        prisma.accessibilityAudit.count({ where: { schoolId, status: { not: "PASS" } } }),
        prisma.seoCheck.count({ where: { schoolId, status: { not: "PASS" } } }),
        prisma.deploymentCheck.count({ where: { schoolId, status: { not: "PASS" } } }),
        prisma.loadTestResult.count({ where: { schoolId, status: { not: "PASS" } } }),
        prisma.regressionCheck.count({ where: { schoolId, status: { not: "PASS" } } })
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),
      prisma.errorMonitoringEvent.count({ where: { schoolId, status: "OPEN" } })
    ]);
    return ok(res, { performance, accessibility, seo, errors, deployment, load, regression, failing, openErrors, releaseStatus: failing === 0 && openErrors === 0 ? "READY" : "ATTENTION" });
  } catch (error) {
    next(error);
  }
});

router.get("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    if (!resource) return;
    const schoolId = scopeSchool(req);
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
    if (!resource) return;
    const schoolId = scopeSchool(req);
    const delegate = prisma[modelByResource[resource]] as any;
    const data = schemas[resource].parse(req.body);
    const row = await delegate.create({ data: { ...data, schoolId } });
    await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) return fail(res, 409, "CONFLICT", "Production readiness record could not be saved.");
    next(error);
  }
});

router.patch("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    if (!resource) return;
    const delegate = prisma[modelByResource[resource]] as any;
    const data = schemas[resource].partial().parse(req.body);
    await ensureOwnRecord(delegate, routeId(req), scopeSchool(req));
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
    if (!resource) return;
    const delegate = prisma[modelByResource[resource]] as any;
    await ensureOwnRecord(delegate, routeId(req), scopeSchool(req));
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
    fail(res, 404, "NOT_FOUND", "Production readiness resource not found.");
    return null;
  }
  return resource;
}

function scopeSchool(req: Request) {
  return req.auth?.schoolId ?? null;
}

function buildWhere(resource: Resource, schoolId: string | null, search?: string, status?: string) {
  const where: any = { schoolId };
  if (status) where.status = status;
  if (!search) return where;
  const fields: Record<Resource, string[]> = {
    performance: ["area", "metric", "unit", "notes"],
    accessibility: ["page", "rule", "impact", "notes"],
    seo: ["page", "title", "description", "canonical", "notes"],
    errors: ["source", "severity", "message", "status"],
    deployment: ["environment", "checkName", "notes"],
    load: ["scenario", "notes"],
    regression: ["suite", "checkName", "notes"]
  };
  where.OR = fields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "load") return { testedAt: "desc" };
  if (resource === "errors") return { occurredAt: "desc" };
  return { checkedAt: "desc" };
}

async function ensureOwnRecord(delegate: any, id: string, schoolId: string | null) {
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

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as productionReadinessRoutes };

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
  books: z.object({ title: z.string().min(2), author: z.string().min(2), isbn: z.string().min(2), copies: z.coerce.number().int().min(1).default(1), status: z.string().default("AVAILABLE") }),
  issues: z.object({ bookTitle: z.string().min(2), isbn: z.string().min(2), borrowerName: z.string().min(2), borrowerType: z.string().min(2), issuedOn: z.coerce.date(), dueOn: z.coerce.date(), status: z.string().default("ISSUED") }),
  returns: z.object({ bookTitle: z.string().min(2), isbn: z.string().min(2), borrowerName: z.string().min(2), returnedOn: z.coerce.date(), condition: z.string().default("GOOD"), status: z.string().default("RETURNED") }),
  fines: z.object({ borrowerName: z.string().min(2), bookTitle: z.string().min(2), amount: z.coerce.number().int().min(1), reason: z.string().min(2), issuedOn: z.coerce.date(), status: z.string().default("PENDING") })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  books: "libraryBook",
  issues: "libraryIssue",
  returns: "libraryReturn",
  fines: "libraryFine"
};

const columnsByResource: Record<Resource, string[]> = {
  books: ["id", "title", "author", "isbn", "copies", "status"],
  issues: ["id", "bookTitle", "isbn", "borrowerName", "borrowerType", "issuedOn", "dueOn", "status"],
  returns: ["id", "bookTitle", "isbn", "borrowerName", "returnedOn", "condition", "status"],
  fines: ["id", "borrowerName", "bookTitle", "amount", "reason", "issuedOn", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.LIBRARY_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [books, issues, returns, fines, availableBooks, pendingFines, fineAggregate] = await Promise.all([
      prisma.libraryBook.count({ where: { schoolId } }),
      prisma.libraryIssue.count({ where: { schoolId } }),
      prisma.libraryReturn.count({ where: { schoolId } }),
      prisma.libraryFine.count({ where: { schoolId } }),
      prisma.libraryBook.count({ where: { schoolId, status: "AVAILABLE" } }),
      prisma.libraryFine.count({ where: { schoolId, status: "PENDING" } }),
      prisma.libraryFine.aggregate({ where: { schoolId }, _sum: { amount: true } })
    ]);
    return ok(res, { books, issues, returns, fines, availableBooks, pendingFines, fineAmount: fineAggregate._sum.amount ?? 0 });
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
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Library record could not be saved.");
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
    fail(res, 404, "NOT_FOUND", "Library resource not found.");
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
    books: ["title", "author", "isbn"],
    issues: ["bookTitle", "isbn", "borrowerName", "borrowerType"],
    returns: ["bookTitle", "isbn", "borrowerName", "condition"],
    fines: ["borrowerName", "bookTitle", "reason"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "issues") return { dueOn: "desc" };
  if (resource === "returns") return { returnedOn: "desc" };
  if (resource === "fines") return { issuedOn: "desc" };
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

export { router as libraryRoutes };

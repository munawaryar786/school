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
  ledger: z.object({ entryNumber: z.string().min(2), accountCode: z.string().min(1), accountName: z.string().min(2), entryDate: z.coerce.date(), description: z.string().min(2), debitAmount: z.coerce.number().int().min(0).default(0), creditAmount: z.coerce.number().int().min(0).default(0), referenceType: z.string().min(2), referenceNumber: z.string().min(2), status: z.string().default("POSTED") }),
  accounts: z.object({ accountCode: z.string().min(1), accountName: z.string().min(2), accountType: z.string().min(2), parentCode: z.string().optional(), description: z.string().min(2), status: z.string().default("ACTIVE") }),
  budgets: z.object({ budgetCode: z.string().min(2), title: z.string().min(2), department: z.string().min(2), fiscalYear: z.string().min(2), budgetAmount: z.coerce.number().int().min(1), spentAmount: z.coerce.number().int().min(0).default(0), ownerName: z.string().min(2), status: z.string().default("APPROVED") }),
  expenses: z.object({ expenseNumber: z.string().min(2), vendorName: z.string().min(2), department: z.string().min(2), expenseDate: z.coerce.date(), category: z.string().min(2), amount: z.coerce.number().int().min(1), paymentMethod: z.string().min(2), status: z.string().default("APPROVED") }),
  statements: z.object({ statementNumber: z.string().min(2), title: z.string().min(2), statementType: z.string().min(2), period: z.string().min(2), revenueAmount: z.coerce.number().int().min(0), expenseAmount: z.coerce.number().int().min(0), netAmount: z.coerce.number().int(), preparedBy: z.string().min(2), status: z.string().default("PUBLISHED") })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  ledger: "generalLedgerEntry",
  accounts: "chartOfAccount",
  budgets: "budgetRecord",
  expenses: "expenseRecord",
  statements: "financialStatement"
};

const columnsByResource: Record<Resource, string[]> = {
  ledger: ["id", "entryNumber", "accountCode", "accountName", "entryDate", "description", "debitAmount", "creditAmount", "referenceType", "referenceNumber", "status"],
  accounts: ["id", "accountCode", "accountName", "accountType", "parentCode", "description", "status"],
  budgets: ["id", "budgetCode", "title", "department", "fiscalYear", "budgetAmount", "spentAmount", "ownerName", "status"],
  expenses: ["id", "expenseNumber", "vendorName", "department", "expenseDate", "category", "amount", "paymentMethod", "status"],
  statements: ["id", "statementNumber", "title", "statementType", "period", "revenueAmount", "expenseAmount", "netAmount", "preparedBy", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.ADVANCED_FINANCE_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [ledger, accounts, budgets, expenses, statements, debit, credit, budget, spent, expenseTotal, net] = await Promise.all([
      prisma.generalLedgerEntry.count({ where: { schoolId } }),
      prisma.chartOfAccount.count({ where: { schoolId } }),
      prisma.budgetRecord.count({ where: { schoolId } }),
      prisma.expenseRecord.count({ where: { schoolId } }),
      prisma.financialStatement.count({ where: { schoolId } }),
      prisma.generalLedgerEntry.aggregate({ where: { schoolId }, _sum: { debitAmount: true } }),
      prisma.generalLedgerEntry.aggregate({ where: { schoolId }, _sum: { creditAmount: true } }),
      prisma.budgetRecord.aggregate({ where: { schoolId }, _sum: { budgetAmount: true } }),
      prisma.budgetRecord.aggregate({ where: { schoolId }, _sum: { spentAmount: true } }),
      prisma.expenseRecord.aggregate({ where: { schoolId }, _sum: { amount: true } }),
      prisma.financialStatement.aggregate({ where: { schoolId }, _sum: { netAmount: true } })
    ]);
    return ok(res, {
      ledger,
      accounts,
      budgets,
      expenses,
      statements,
      debitAmount: debit._sum.debitAmount ?? 0,
      creditAmount: credit._sum.creditAmount ?? 0,
      budgetAmount: budget._sum.budgetAmount ?? 0,
      spentAmount: spent._sum.spentAmount ?? 0,
      expenseAmount: expenseTotal._sum.amount ?? 0,
      netAmount: net._sum.netAmount ?? 0
    });
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
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Advanced finance record could not be saved.");
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
    fail(res, 404, "NOT_FOUND", "Advanced finance resource not found.");
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
    ledger: ["entryNumber", "accountCode", "accountName", "description", "referenceType", "referenceNumber"],
    accounts: ["accountCode", "accountName", "accountType", "parentCode", "description"],
    budgets: ["budgetCode", "title", "department", "fiscalYear", "ownerName"],
    expenses: ["expenseNumber", "vendorName", "department", "category", "paymentMethod"],
    statements: ["statementNumber", "title", "statementType", "period", "preparedBy"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "ledger") return { entryDate: "desc" };
  if (resource === "expenses") return { expenseDate: "desc" };
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

export { router as advancedFinanceRoutes };

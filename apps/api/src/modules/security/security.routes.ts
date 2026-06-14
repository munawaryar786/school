import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PERMISSIONS } from "@school-erp/shared";
import { env } from "../../config/env";
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

const twoFactorSchema = z.object({ userId: z.string().min(1), schoolId: z.string().optional().nullable() });
const verifyTwoFactorSchema = twoFactorSchema.extend({ code: z.string().min(6).max(10) });

const schemas = {
  secrets: z.object({ key: z.string().min(2), value: z.string().min(1), status: z.string().default("ACTIVE") }),
  "api-rules": z.object({ name: z.string().min(2), ruleType: z.string().min(2), pattern: z.string().min(1), action: z.string().min(2), severity: z.string().default("MEDIUM"), status: z.string().default("ACTIVE") }),
  "backup-policies": z.object({ name: z.string().min(2), frequency: z.string().min(2), retentionDays: z.coerce.number().int().min(1).default(30), storageTarget: z.string().min(2), encryptionEnabled: z.coerce.boolean().default(true), lastBackupAt: z.coerce.date().optional(), status: z.string().default("ACTIVE") })
} as const;

type Resource = keyof typeof schemas | "two-factor" | "audit-logs" | "backups";
type WritableResource = keyof typeof schemas;

const columnsByResource: Record<Resource, string[]> = {
  "two-factor": ["id", "userId", "schoolId", "enabled", "algorithm", "status", "verifiedAt", "createdAt"],
  "audit-logs": ["id", "action", "resource", "resourceId", "ipAddress", "userAgent", "createdAt"],
  secrets: ["id", "key", "algorithm", "status", "rotatedAt", "createdAt"],
  "api-rules": ["id", "name", "ruleType", "pattern", "action", "severity", "status"],
  "backup-policies": ["id", "name", "frequency", "retentionDays", "storageTarget", "encryptionEnabled", "lastBackupAt", "status"],
  backups: ["id", "status", "filePath", "fileSize", "checksum", "createdById", "restoredAt", "createdAt"]
};

router.use(authenticate, requirePermission(PERMISSIONS.SECURITY_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = scopeSchool(req);
    const [twoFactorEnabled, auditLogs, activeSecrets, apiRules, backupPolicies, backups, blockedRules] = await Promise.all([
      prisma.userTwoFactorSetting.count({ where: { schoolId, enabled: true } }),
      prisma.auditLog.count({ where: { schoolId } }),
      prisma.securitySecret.count({ where: { schoolId, status: "ACTIVE" } }),
      prisma.apiSecurityRule.count({ where: { schoolId } }),
      prisma.securityBackupPolicy.count({ where: { schoolId } }),
      prisma.backupJob.count(),
      prisma.apiSecurityRule.count({ where: { schoolId, action: "BLOCK", status: "ACTIVE" } })
    ]);
    return ok(res, { twoFactorEnabled, auditLogs, activeSecrets, apiRules, backupPolicies, backups, blockedRules, apiSecurity: "ENABLED" });
  } catch (error) {
    next(error);
  }
});

router.post("/two-factor/setup", async (req, res, next) => {
  try {
    const input = twoFactorSchema.parse(req.body);
    const schoolId = normalizeSchool(input.schoolId ?? scopeSchool(req));
    const secret = crypto.randomBytes(20).toString("base64url");
    const encrypted = encrypt(secret);
    const existing = await prisma.userTwoFactorSetting.findFirst({ where: { userId: input.userId, schoolId } });
    const setting = existing
      ? await prisma.userTwoFactorSetting.update({ where: { id: existing.id }, data: { secretEncrypted: encrypted.bundle, enabled: false, status: "PENDING", recoveryCodes: [], verifiedAt: null } })
      : await prisma.userTwoFactorSetting.create({ data: { userId: input.userId, schoolId, secretEncrypted: encrypted.bundle, enabled: false, status: "PENDING", recoveryCodes: [] } });
    await writeAudit(req, "SETTINGS_UPDATE", "twoFactor", setting.id, { userId: input.userId });
    return ok(res, { id: setting.id, userId: setting.userId, schoolId: setting.schoolId, secret, currentCode: totp(secret), status: setting.status }, 201);
  } catch (error) {
    next(error);
  }
});

router.post("/two-factor/verify", async (req, res, next) => {
  try {
    const input = verifyTwoFactorSchema.parse(req.body);
    const schoolId = normalizeSchool(input.schoolId ?? scopeSchool(req));
    const setting = await prisma.userTwoFactorSetting.findFirstOrThrow({ where: { userId: input.userId, schoolId } });
    if (!verifyTotp(decryptBundle(setting.secretEncrypted), input.code)) {
      return fail(res, 400, "VALIDATION_ERROR", "Two-factor code is invalid.");
    }
    const updated = await prisma.userTwoFactorSetting.update({ where: { id: setting.id }, data: { enabled: true, status: "VERIFIED", verifiedAt: new Date() } });
    await writeAudit(req, "SETTINGS_UPDATE", "twoFactor", updated.id, { enabled: true });
    return ok(res, sanitizeTwoFactor(updated));
  } catch (error) {
    next(error);
  }
});

router.post("/two-factor/disable", async (req, res, next) => {
  try {
    const input = twoFactorSchema.parse(req.body);
    const schoolId = normalizeSchool(input.schoolId ?? scopeSchool(req));
    const setting = await prisma.userTwoFactorSetting.findFirstOrThrow({ where: { userId: input.userId, schoolId } });
    const updated = await prisma.userTwoFactorSetting.update({ where: { id: setting.id }, data: { enabled: false, status: "DISABLED" } });
    await writeAudit(req, "SETTINGS_UPDATE", "twoFactor", updated.id, { enabled: false });
    return ok(res, sanitizeTwoFactor(updated));
  } catch (error) {
    next(error);
  }
});

router.post("/backups/run", async (req, res, next) => {
  try {
    const backupDir = path.resolve(".data/security-backups");
    await fs.mkdir(backupDir, { recursive: true });
    const snapshot = {
      generatedAt: new Date().toISOString(),
      schools: await prisma.school.count(),
      users: await prisma.user.count(),
      auditLogs: await prisma.auditLog.count(),
      securityRules: await prisma.apiSecurityRule.findMany({ where: { schoolId: scopeSchool(req) } }),
      backupPolicies: await prisma.securityBackupPolicy.findMany({ where: { schoolId: scopeSchool(req) } })
    };
    const content = JSON.stringify(snapshot, null, 2);
    const checksum = crypto.createHash("sha256").update(content).digest("hex");
    const filePath = path.join(backupDir, `security-backup-${Date.now()}.json`);
    await fs.writeFile(filePath, content, "utf8");
    const backup = await prisma.backupJob.create({ data: { filePath, fileSize: Buffer.byteLength(content), checksum, createdById: req.auth!.userId, metadata: { scope: scopeSchool(req), encrypted: true } } });
    await writeAudit(req, "BACKUP", "securityBackup", backup.id, { filePath, checksum });
    return ok(res, backup, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    if (!resource) return;
    const query = pageQuerySchema.parse(req.query);
    const { rows, total } = await listResource(resource, query, scopeSchool(req));
    if (query.format === "csv") {
      await writeAudit(req, "EXPORT", resource, "csv", { search: query.search, status: query.status });
      return csv(res, `${resource}.csv`, rows as Array<Record<string, unknown>>, columnsByResource[resource]);
    }
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/:resource", async (req, res, next) => {
  try {
    const resource = parseWritableResource(req, res);
    if (!resource) return;
    const schoolId = scopeSchool(req);
    const data = schemas[resource].parse(req.body);
    const row = await createResource(resource, data, schoolId);
    const metadata = resource === "secrets" ? { key: (data as z.infer<typeof schemas.secrets>).key, value: "[REDACTED]" } : (data as Record<string, unknown>);
    await writeAudit(req, "CREATE", resource, row.id, metadata);
    return ok(res, sanitize(row), 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) return fail(res, 409, "CONFLICT", "Security record could not be saved.");
    next(error);
  }
});

router.delete("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseWritableResource(req, res);
    if (!resource) return;
    await deleteResource(resource, routeId(req), scopeSchool(req));
    await writeAudit(req, "DELETE", resource, routeId(req), {});
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!["two-factor", "audit-logs", "secrets", "api-rules", "backup-policies", "backups"].includes(resource)) {
    fail(res, 404, "NOT_FOUND", "Security resource not found.");
    return null;
  }
  return resource;
}

function parseWritableResource(req: Request, res: Response): WritableResource | null {
  const resource = req.params.resource as WritableResource;
  if (!resource || !(resource in schemas)) {
    fail(res, 403, "FORBIDDEN", "This security resource is managed through a dedicated workflow.");
    return null;
  }
  return resource;
}

async function listResource(resource: Resource, query: z.infer<typeof pageQuerySchema>, schoolId: string | null) {
  const where = buildWhere(resource, query.search, query.status, schoolId);
  const skip = (query.page - 1) * query.pageSize;
  if (resource === "two-factor") {
    const [rows, total] = await Promise.all([prisma.userTwoFactorSetting.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.pageSize }), prisma.userTwoFactorSetting.count({ where })]);
    return { rows: rows.map(sanitizeTwoFactor), total };
  }
  if (resource === "audit-logs") {
    const [rows, total] = await Promise.all([prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.pageSize }), prisma.auditLog.count({ where })]);
    return { rows, total };
  }
  if (resource === "secrets") {
    const [rows, total] = await Promise.all([prisma.securitySecret.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.pageSize }), prisma.securitySecret.count({ where })]);
    return { rows: rows.map(sanitize), total };
  }
  if (resource === "api-rules") {
    const [rows, total] = await Promise.all([prisma.apiSecurityRule.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.pageSize }), prisma.apiSecurityRule.count({ where })]);
    return { rows, total };
  }
  if (resource === "backup-policies") {
    const [rows, total] = await Promise.all([prisma.securityBackupPolicy.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.pageSize }), prisma.securityBackupPolicy.count({ where })]);
    return { rows, total };
  }
  const [rows, total] = await Promise.all([prisma.backupJob.findMany({ orderBy: { createdAt: "desc" }, skip, take: query.pageSize }), prisma.backupJob.count()]);
  return { rows, total };
}

function buildWhere(resource: Resource, search: string | undefined, status: string | undefined, schoolId: string | null) {
  const where: any = resource === "backups" ? {} : { schoolId };
  if (status && resource !== "audit-logs") where.status = status;
  if (!search) return where;
  const fields: Record<Resource, string[]> = {
    "two-factor": ["userId", "status"],
    "audit-logs": ["resource", "resourceId", "ipAddress", "userAgent"],
    secrets: ["key", "status"],
    "api-rules": ["name", "ruleType", "pattern", "action", "severity"],
    "backup-policies": ["name", "frequency", "storageTarget"],
    backups: ["filePath", "checksum"]
  };
  where.OR = fields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

async function createResource(resource: WritableResource, data: z.infer<(typeof schemas)[WritableResource]>, schoolId: string | null) {
  if (resource === "secrets") {
    const input = data as z.infer<typeof schemas.secrets>;
    const encrypted = encrypt(input.value);
    return prisma.securitySecret.create({ data: { schoolId, key: input.key, encryptedValue: encrypted.encryptedValue, iv: encrypted.iv, authTag: encrypted.authTag, status: input.status, rotatedAt: new Date() } });
  }
  if (resource === "api-rules") return prisma.apiSecurityRule.create({ data: { ...(data as z.infer<typeof schemas["api-rules"]>), schoolId } });
  return prisma.securityBackupPolicy.create({ data: { ...(data as z.infer<typeof schemas["backup-policies"]>), schoolId } });
}

async function deleteResource(resource: WritableResource, id: string, schoolId: string | null) {
  if (resource === "secrets") return prisma.securitySecret.delete({ where: { id } });
  if (resource === "api-rules") return prisma.apiSecurityRule.delete({ where: { id } });
  return prisma.securityBackupPolicy.delete({ where: { id } });
}

function scopeSchool(req: Request) {
  return req.auth?.schoolId ?? null;
}

function normalizeSchool(value: string | null | undefined) {
  return value || null;
}

function encrypt(value: string) {
  const key = crypto.createHash("sha256").update(env.JWT_REFRESH_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const bundle = `${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`;
  return { bundle, encryptedValue: encrypted.toString("base64url"), iv: iv.toString("base64url"), authTag: cipher.getAuthTag().toString("base64url") };
}

function decryptBundle(bundle: string) {
  const [iv, authTag, encryptedValue] = bundle.split(":");
  const key = crypto.createHash("sha256").update(env.JWT_REFRESH_SECRET).digest();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8");
}

function verifyTotp(secret: string, code: string) {
  const now = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((offset) => totp(secret, now + offset) === code.padStart(6, "0"));
}

function totp(secret: string, counter = Math.floor(Date.now() / 30000)) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", secret).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

function sanitize(row: any) {
  const { encryptedValue, iv, authTag, secretEncrypted, recoveryCodes, ...safe } = row;
  return safe;
}

function sanitizeTwoFactor(row: any) {
  const safe = sanitize(row);
  return safe;
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
  const text = value instanceof Date ? value.toISOString() : typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function routeId(req: Request) {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as securityRoutes };

import type { AuditAction, Prisma, PrismaClient } from "@prisma/client";

type AuditInput = {
  userId?: string | null;
  schoolId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

export class AuditService {
  constructor(private readonly db: PrismaClient) {}

  async record(input: AuditInput) {
    await this.db.auditLog.create({
      data: {
        userId: input.userId ?? null,
        schoolId: input.schoolId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      }
    });
  }
}

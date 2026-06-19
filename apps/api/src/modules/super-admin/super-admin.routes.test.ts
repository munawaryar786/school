import assert from "node:assert/strict";
import { after, beforeEach, describe, it, mock } from "node:test";
import express from "express";
import request from "supertest";
import { PERMISSIONS } from "@school-erp/shared";

const prismaMock = makePrismaMock();
const auditRecord = mock.fn(async () => undefined);

mock.module("../../db/prisma", {
  namedExports: {
    prisma: prismaMock
  }
});

mock.module("../audit/audit.service", {
  namedExports: {
    AuditService: class {
      record = auditRecord;
    }
  }
});

mock.module("../auth/auth.middleware", {
  namedExports: {
    authenticate: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      const permissions = req.header("x-test-permissions")?.split(",").filter(Boolean) ?? [];
      req.auth = {
        userId: "super_1",
        role: "SUPER_ADMIN",
        schoolId: null,
        membershipId: null,
        permissions
      };
      next();
    },
    requirePermission: (permission: string) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!req.auth?.permissions.includes(permission)) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Denied" }, meta: { requestId: "test" } });
      }
      next();
    }
  }
});

const { superAdminRoutes } = await import("./super-admin.routes.ts");

const app = express();
app.use(express.json());
app.use((_, res, next) => {
  res.locals.requestId = "test";
  next();
});
app.use("/v1/super-admin", superAdminRoutes);
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ success: false, error: { message: error instanceof Error ? error.message : "error" }, meta: { requestId: "test" } });
});

describe("Super Admin routes", () => {
  beforeEach(() => {
    resetPrismaMock(prismaMock);
    auditRecord.mock.resetCalls();
  });

  after(() => {
    mock.reset();
  });

  it("creates a school and records audit", async () => {
    prismaMock.school.create.mock.mockImplementationOnce(async ({ data }: any) => ({ id: "school_1", ...data }));

    const response = await request(app)
      .post("/v1/super-admin/schools")
      .set("x-test-permissions", PERMISSIONS.SCHOOLS_CREATE)
      .send({ name: "North Ridge", slug: "north-ridge", status: "TRIAL" });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.id, "school_1");
    assert.equal(prismaMock.school.create.mock.callCount(), 1);
    assert.equal(auditRecord.mock.callCount(), 1);
  });

  it("updates a school", async () => {
    prismaMock.school.update.mock.mockImplementationOnce(async ({ data }: any) => ({ id: "school_1", ...data }));

    const response = await request(app)
      .patch("/v1/super-admin/schools/school_1")
      .set("x-test-permissions", PERMISSIONS.SCHOOLS_UPDATE)
      .send({ name: "Updated School", status: "ACTIVE" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, "Updated School");
    assert.equal(prismaMock.school.update.mock.callCount(), 1);
  });

  it("archives a school", async () => {
    prismaMock.school.update.mock.mockImplementationOnce(async ({ data }: any) => ({ id: "school_1", name: "North Ridge", ...data }));

    const response = await request(app)
      .delete("/v1/super-admin/schools/school_1")
      .set("x-test-permissions", PERMISSIONS.SCHOOLS_DELETE);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.deleted, true);
    assert.equal(prismaMock.school.update.mock.calls[0].arguments[0].data.status, "ARCHIVED");
  });

  it("denies create school without permission", async () => {
    const response = await request(app).post("/v1/super-admin/schools").send({ name: "North Ridge", slug: "north-ridge" });

    assert.equal(response.status, 403);
    assert.equal(prismaMock.school.create.mock.callCount(), 0);
  });

  it("returns dashboard aggregate response", async () => {
    prismaMock.school.count.mock.mockImplementation(async ({ where }: any) => {
      if (where?.status === "ACTIVE") return 2;
      if (where?.status === "SUSPENDED") return 1;
      return 3;
    });
    prismaMock.campus.count.mock.mockImplementationOnce(async () => 4);
    prismaMock.user.count.mock.mockImplementationOnce(async () => 9);
    prismaMock.studentProfile.count.mock.mockImplementationOnce(async () => 5);
    prismaMock.schoolMembership.count.mock.mockImplementationOnce(async () => 6);
    prismaMock.school.groupBy.mock.mockImplementationOnce(async () => [{ status: "ACTIVE", _count: { _all: 2 } }]);
    prismaMock.schoolMembership.groupBy.mock.mockImplementationOnce(async () => [{ roleId: "role_admin", _count: { _all: 1 } }]);
    prismaMock.auditLog.findMany.mock.mockImplementationOnce(async () => [{ id: "audit_1", action: "CREATE", resource: "school", resourceId: "school_1", school: null, user: { name: "Owner", email: "owner@test.local" }, createdAt: new Date("2026-06-18T00:00:00Z") }]);
    prismaMock.role.findMany.mock.mockImplementationOnce(async () => [{ id: "role_admin", code: "SCHOOL_ADMIN" }]);

    const response = await request(app)
      .get("/v1/super-admin/dashboard")
      .set("x-test-permissions", PERMISSIONS.SCHOOLS_READ);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.metrics.totalSchools, 3);
    assert.equal(response.body.data.metrics.totalCampuses, 4);
    assert.equal(response.body.data.usersByRole[0].role, "SCHOOL_ADMIN");
  });
});

function makePrismaMock() {
  return {
    school: {
      count: mock.fn(async () => 0),
      groupBy: mock.fn(async () => []),
      findMany: mock.fn(async () => []),
      findFirst: mock.fn(async () => null),
      create: mock.fn(async () => ({})),
      update: mock.fn(async () => ({}))
    },
    campus: {
      count: mock.fn(async () => 0),
      findMany: mock.fn(async () => []),
      findUnique: mock.fn(async () => null),
      create: mock.fn(async () => ({})),
      update: mock.fn(async () => ({}))
    },
    user: {
      count: mock.fn(async () => 0),
      upsert: mock.fn(async () => ({ id: "user_1" })),
      update: mock.fn(async () => ({})),
      findMany: mock.fn(async () => []),
      create: mock.fn(async () => ({}))
    },
    studentProfile: {
      count: mock.fn(async () => 0)
    },
    schoolMembership: {
      count: mock.fn(async () => 0),
      groupBy: mock.fn(async () => []),
      findMany: mock.fn(async () => []),
      findUnique: mock.fn(async () => null),
      findFirst: mock.fn(async () => null),
      create: mock.fn(async () => ({ id: "membership_1" })),
      update: mock.fn(async () => ({ id: "membership_1", userId: "user_1" }))
    },
    auditLog: {
      findMany: mock.fn(async () => []),
      count: mock.fn(async () => 0),
      create: mock.fn(async () => ({}))
    },
    role: {
      findMany: mock.fn(async () => []),
      findUniqueOrThrow: mock.fn(async () => ({ id: "role_admin", code: "SCHOOL_ADMIN" }))
    },
    subscription: {
      count: mock.fn(async () => 0),
      aggregate: mock.fn(async () => ({ _sum: { amount: 0 } })),
      findMany: mock.fn(async () => []),
      create: mock.fn(async () => ({})),
      update: mock.fn(async () => ({}))
    },
    subscriptionPlan: {
      findMany: mock.fn(async () => []),
      create: mock.fn(async () => ({})),
      upsert: mock.fn(async () => ({}))
    },
    systemSetting: {
      findMany: mock.fn(async () => []),
      upsert: mock.fn(async () => ({}))
    },
    backupJob: {
      create: mock.fn(async () => ({})),
      findMany: mock.fn(async () => []),
      findUniqueOrThrow: mock.fn(async () => ({})),
      update: mock.fn(async () => ({}))
    },
    $transaction: mock.fn(async (callback: any) => callback(prismaMock))
  };
}

function resetPrismaMock(client: ReturnType<typeof makePrismaMock>) {
  for (const delegate of Object.values(client)) {
    if (typeof delegate !== "object" || delegate === null) continue;
    for (const value of Object.values(delegate)) {
      if (typeof value === "function" && "mock" in value) {
        (value as any).mock.resetCalls();
      }
    }
  }
}

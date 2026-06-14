import bcrypt from "bcryptjs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ROLES } from "@school-erp/shared";
import { AuthError, AuthService } from "./auth.service";
import type { AuthRepository, AuthUserRecord } from "./auth.repository";

function makeRepository(user: AuthUserRecord | null): AuthRepository {
  return {
    findUserByEmail: async () => user,
    createSession: async (input) =>
      ({
        id: "session_1",
        userId: input.userId,
        membershipId: input.membershipId,
        refreshHash: input.refreshHash,
        status: "ACTIVE",
        expiresAt: input.expiresAt,
        createdAt: new Date(),
        revokedAt: null
      }) as never,
    revokeUserSessions: async () => undefined
  };
}

describe("AuthService", () => {
  it("logs in an active school admin and returns role permissions", async () => {
    const passwordHash = await bcrypt.hash("Password123!", 4);
    const service = new AuthService(makeRepository(makeUser(passwordHash)), {
      accessSecret: "a".repeat(40),
      refreshSecret: "b".repeat(40),
      accessExpiresIn: "15m",
      refreshExpiresIn: "7d"
    });

    const result = await service.login({
      email: "admin@demo-academy.local",
      password: "Password123!",
      schoolId: "school_1"
    });

    assert.equal(result.user.activeRole, ROLES.SCHOOL_ADMIN);
    assert.equal(result.user.activeSchoolId, "school_1");
    assert.ok(result.user.permissions.includes("school.dashboard.read"));
    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
  });

  it("rejects an invalid password", async () => {
    const passwordHash = await bcrypt.hash("Password123!", 4);
    const service = new AuthService(makeRepository(makeUser(passwordHash)), {
      accessSecret: "a".repeat(40),
      refreshSecret: "b".repeat(40),
      accessExpiresIn: "15m",
      refreshExpiresIn: "7d"
    });

    await assert.rejects(
      () =>
        service.login({
        email: "admin@demo-academy.local",
        password: "wrong-password",
        schoolId: "school_1"
      }),
      AuthError
    );
  });
});

function makeUser(passwordHash: string): AuthUserRecord {
  return {
    id: "user_1",
    email: "admin@demo-academy.local",
    name: "School Admin",
    passwordHash,
    isActive: true,
    memberships: [
      {
        id: "membership_1",
        schoolId: "school_1",
        status: "ACTIVE",
        school: { id: "school_1", name: "Demo Academy" },
        role: { code: ROLES.SCHOOL_ADMIN }
      }
    ],
    twoFactorSettings: []
  };
}

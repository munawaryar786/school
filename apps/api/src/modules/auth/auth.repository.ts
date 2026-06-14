import type { PrismaClient, Session } from "@prisma/client";

export type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  isActive: boolean;
  memberships: Array<{
    id: string;
    schoolId: string | null;
    status: "ACTIVE" | "INVITED" | "SUSPENDED";
    school: { id: string; name: string } | null;
    role: { code: string };
  }>;
  twoFactorSettings: Array<{
    schoolId: string | null;
    secretEncrypted: string;
    enabled: boolean;
    status: string;
  }>;
};

export interface AuthRepository {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>;
  createSession(input: {
    userId: string;
    membershipId: string | null;
    refreshHash: string;
    expiresAt: Date;
  }): Promise<Session>;
  revokeUserSessions(userId: string): Promise<void>;
}

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly db: PrismaClient) {}

  findUserByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            school: { select: { id: true, name: true } },
            role: { select: { code: true } }
          }
        },
        twoFactorSettings: {
          where: { enabled: true, status: "VERIFIED" },
          select: { schoolId: true, secretEncrypted: true, enabled: true, status: true }
        }
      }
    });
  }

  createSession(input: {
    userId: string;
    membershipId: string | null;
    refreshHash: string;
    expiresAt: Date;
  }) {
    return this.db.session.create({
      data: input
    });
  }

  async revokeUserSessions(userId: string) {
    await this.db.session.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: new Date() }
    });
  }
}

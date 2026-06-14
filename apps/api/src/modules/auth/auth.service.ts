import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { loginSchema, ROLE_PERMISSIONS, roleSchema, type AuthUser, type LoginInput, type LoginResult } from "@school-erp/shared";
import type { AuthRepository, AuthUserRecord } from "./auth.repository";

type AuthConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
};

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly config: AuthConfig
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const parsed = loginSchema.parse(input);
    const user = await this.repository.findUserByEmail(parsed.email.toLowerCase());

    if (!user || !user.isActive) {
      throw new AuthError("Invalid email or password.");
    }

    const passwordOk = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!passwordOk) {
      throw new AuthError("Invalid email or password.");
    }

    const membership = selectMembership(user, parsed.schoolId);
    if (!membership) {
      throw new AuthError("No active membership is available for this account.");
    }

    const twoFactor = user.twoFactorSettings.find((item) => item.schoolId === membership.schoolId) ?? user.twoFactorSettings.find((item) => item.schoolId === null);
    if (twoFactor?.enabled) {
      if (!parsed.twoFactorCode || !verifyTotp(decryptSecret(twoFactor.secretEncrypted, this.config.refreshSecret), parsed.twoFactorCode)) {
        throw new AuthError("A valid two-factor code is required.");
      }
    }

    const role = roleSchema.parse(membership.role.code);
    const permissions = ROLE_PERMISSIONS[role];
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      activeRole: role,
      activeSchoolId: membership.schoolId,
      permissions,
      memberships: user.memberships
        .filter((item) => item.status === "ACTIVE")
        .map((item) => ({
          schoolId: item.schoolId,
          schoolName: item.school?.name ?? null,
          role: roleSchema.parse(item.role.code)
        }))
    };

    const refreshToken = crypto.randomBytes(48).toString("base64url");
    const refreshHash = await bcrypt.hash(refreshToken, 12);
    const expiresAt = new Date(Date.now() + parseDuration(this.config.refreshExpiresIn));
    await this.repository.createSession({
      userId: user.id,
      membershipId: membership.id,
      refreshHash,
      expiresAt
    });

    const accessToken = jwt.sign(
      {
        sub: user.id,
        role,
        schoolId: membership.schoolId,
        membershipId: membership.id,
        permissions
      },
      this.config.accessSecret,
      { expiresIn: this.config.accessExpiresIn as jwt.SignOptions["expiresIn"] }
    );

    return {
      accessToken,
      refreshToken,
      user: authUser
    };
  }

  async logout(userId: string) {
    await this.repository.revokeUserSessions(userId);
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

function selectMembership(user: AuthUserRecord, schoolId?: string) {
  const active = user.memberships.filter((membership) => membership.status === "ACTIVE");
  if (schoolId) {
    return active.find((membership) => membership.schoolId === schoolId) ?? null;
  }

  return active.find((membership) => membership.schoolId === null) ?? active[0] ?? null;
}

function parseDuration(value: string) {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };
  return amount * multipliers[unit as keyof typeof multipliers];
}

function decryptSecret(encrypted: string, secret: string) {
  const [ivText, authTagText, cipherText] = encrypted.split(":");
  const key = crypto.createHash("sha256").update(secret).digest();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(authTagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(cipherText, "base64url")), decipher.final()]).toString("utf8");
}

function verifyTotp(secret: string, code: string) {
  const now = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((offset) => timingSafeEqual(totp(secret, now + offset), code));
}

function totp(secret: string, counter: number) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", secret).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right.padStart(left.length, "0"));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

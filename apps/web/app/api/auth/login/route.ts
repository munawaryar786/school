import { NextResponse } from "next/server";
import { loginSchema, type ApiResponse, type LoginResult } from "@school-erp/shared";

type LoginDiagnostic = { message: string };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email and password."
        }
      },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email and password.",
          details: parsed.error.flatten()
        }
      },
      { status: 400 }
    );
  }

  const target = authLoginUrl();
  if (!target) {
    return diagnostic("API base URL is not configured", 500);
  }

  let response: Response;
  try {
    response = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store"
    });
  } catch {
    return diagnostic("Authentication service is unreachable", 502);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return diagnostic("Authentication service returned an invalid response", 502);
  }

  let payload: ApiResponse<LoginResult>;
  try {
    payload = (await response.json()) as ApiResponse<LoginResult>;
  } catch {
    return diagnostic("Authentication service returned an invalid response", 502);
  }

  if (!isApiResponse(payload)) {
    return diagnostic("Authentication service returned an invalid response", 502);
  }

  if (!response.ok || !payload.success) {
    return NextResponse.json(payload, { status: response.status });
  }

  if (!isLoginResult(payload.data)) {
    return diagnostic("Authentication service returned an invalid response", 502);
  }

  const result = NextResponse.json(payload);
  const secure = process.env.NODE_ENV === "production";
  result.cookies.set("erp_access_token", payload.data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 15
  });
  result.cookies.set("erp_refresh_token", payload.data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  result.cookies.set("erp_role", payload.data.user.activeRole, {
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 15
  });
  result.cookies.set("erp_name", payload.data.user.name, {
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 15
  });
  if (payload.data.user.activeSchoolId) {
    result.cookies.set("erp_school_id", payload.data.user.activeSchoolId, {
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 15
    });
  }

  return result;
}

function authLoginUrl() {
  const rawBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!rawBase) return null;

  try {
    const url = new URL(rawBase);
    const base = url.href.replace(/\/+$/, "");
    return `${base}/v1/auth/login`;
  } catch {
    return null;
  }
}

function diagnostic(message: LoginDiagnostic["message"], status: 500 | 502) {
  return NextResponse.json({ message }, { status });
}

function isApiResponse(value: unknown): value is ApiResponse<LoginResult> {
  return typeof value === "object" && value !== null && "success" in value;
}

function isLoginResult(value: unknown): value is LoginResult {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<LoginResult>;
  return typeof candidate.accessToken === "string" && typeof candidate.refreshToken === "string" && typeof candidate.user === "object" && candidate.user !== null;
}

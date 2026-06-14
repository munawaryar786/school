import { NextResponse } from "next/server";
import { loginSchema, type ApiResponse, type LoginResult } from "@school-erp/shared";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  const body = await request.json();
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

  const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store"
  });
  const payload = (await response.json()) as ApiResponse<LoginResult>;

  if (!response.ok || !payload.success) {
    return NextResponse.json(payload, { status: response.status });
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

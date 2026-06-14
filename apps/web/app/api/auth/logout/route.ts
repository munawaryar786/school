import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST() {
  const store = await cookies();
  const token = store.get("erp_access_token")?.value;

  if (token) {
    await fetch(`${apiUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`
      },
      cache: "no-store"
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  for (const name of ["erp_access_token", "erp_refresh_token", "erp_role", "erp_name", "erp_school_id"]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return response;
}


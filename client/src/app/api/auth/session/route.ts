import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api/config";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
} from "@/lib/auth-session-cookie";

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type LoginData = {
  portal: "lgu" | "company";
  redirectTo: string;
  accessToken: string;
  refreshToken?: string;
  user?: unknown;
  companyAdmin?: unknown;
};

type MeData = {
  portal: "lgu" | "company";
  user?: unknown;
  companyAdmin?: unknown;
};

/**
 * POST — login via Express, set HttpOnly cookie on the app origin.
 * GET — resolve current session from cookie.
 * DELETE — logout + clear cookie.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error:
          "Cannot reach LegisArc API. Is the server running on NEXT_PUBLIC_API_URL?",
      },
      { status: 502 }
    );
  }

  const payload = (await upstream.json()) as ApiEnvelope<LoginData>;
  if (!upstream.ok || !payload.success || !payload.data?.accessToken) {
    return NextResponse.json(
      {
        success: false,
        error: payload.error || "Login failed",
      },
      { status: upstream.status || 401 }
    );
  }

  const { accessToken, refreshToken: _r, ...safe } = payload.data;
  const response = NextResponse.json({ success: true, data: safe });
  response.cookies.set(
    AUTH_COOKIE_NAME,
    accessToken,
    authCookieOptions()
  );
  return response;
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(apiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Cannot reach LegisArc API." },
      { status: 502 }
    );
  }

  const payload = (await upstream.json()) as ApiEnvelope<MeData>;
  if (!upstream.ok || !payload.success || !payload.data) {
    const response = NextResponse.json(
      { success: false, error: payload.error || "Session expired" },
      { status: upstream.status || 401 }
    );
    response.cookies.set(AUTH_COOKIE_NAME, "", authCookieOptions(0));
    return response;
  }

  return NextResponse.json({ success: true, data: payload.data });
}

export async function DELETE() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    try {
      await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      /* still clear cookie */
    }
  }

  const response = NextResponse.json({ success: true, data: null });
  response.cookies.set(AUTH_COOKIE_NAME, "", authCookieOptions(0));
  return response;
}

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

type AccountType = "lgu" | "company";

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isSuperAdminPath(pathname: string) {
  return pathname === "/super-admin" || pathname.startsWith("/super-admin/");
}

function isLoginPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/");
}

function redirectTo(
  request: NextRequest,
  pathname: string,
  searchParams?: Record<string, string>
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return NextResponse.redirect(url);
}

function readCookieToken(request: NextRequest): string | null {
  const raw = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!raw) return null;
  // Cookie is set without encodeURIComponent — use the raw JWT string.
  // Only decode if it looks percent-encoded (avoids corrupting base64url tokens).
  if (raw.includes("%")) {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

function resolveJwtSecret(): string | null {
  const secret = (process.env.JWT_SECRET ?? "").trim();
  return secret.length >= 8 ? secret : null;
}

async function readJwtAccountType(
  token: string
): Promise<AccountType | null> {
  const secret = resolveJwtSecret();
  if (!secret) {
    console.error(
      "[auth-middleware] JWT_SECRET is missing or too short. Set the same JWT_SECRET in repo root .env and client/.env.local, then restart npm run dev."
    );
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );
    const accountType = payload.accountType;
    if (accountType === "lgu" || accountType === "company") {
      return accountType;
    }
  } catch (error) {
    console.error(
      "[auth-middleware] JWT verify failed (usually JWT_SECRET mismatch between API and Next.js — restart both after changing .env):",
      error
    );
    return null;
  }
  return null;
}

/** JWT-cookie session gate for admin / super-admin routes. */
export async function updateSession(request: NextRequest) {
  const pathname = normalizePath(request.nextUrl.pathname);
  const needsAuth = isAdminPath(pathname) || isSuperAdminPath(pathname);
  const token = readCookieToken(request);

  if (!token) {
    if (needsAuth) {
      return redirectTo(request, "/login", { next: pathname });
    }
    return NextResponse.next();
  }

  if (!needsAuth && !isLoginPath(pathname)) {
    return NextResponse.next();
  }

  const accountType = await readJwtAccountType(token);

  if (!accountType) {
    // Invalid/expired token — clear cookie and send protected routes to login.
    // Do NOT clear + bounce in a way that fights the login page auto-redirect:
    // only clear when entering a protected route.
    if (needsAuth) {
      const response = redirectTo(request, "/login", { next: pathname });
      response.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
      return response;
    }
    return NextResponse.next();
  }

  // Already signed in — leave /login alone (client decides redirect).
  if (isLoginPath(pathname)) {
    return NextResponse.next();
  }

  if (isAdminPath(pathname) && accountType !== "lgu") {
    return redirectTo(request, "/super-admin/dashboard");
  }

  if (isSuperAdminPath(pathname) && accountType !== "company") {
    return redirectTo(request, "/admin/dashboard");
  }

  return NextResponse.next();
}

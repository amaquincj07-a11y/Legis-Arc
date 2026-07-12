import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

function redirectWithCookies(
  request: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse,
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

  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = normalizePath(request.nextUrl.pathname);
  const needsAuth = isAdminPath(pathname) || isSuperAdminPath(pathname);

  if (!user) {
    if (needsAuth) {
      return redirectWithCookies(request, "/login", supabaseResponse, {
        next: pathname,
      });
    }
    return supabaseResponse;
  }

  // Only resolve portal membership on auth-sensitive routes.
  if (!needsAuth && !isLoginPath(pathname)) {
    return supabaseResponse;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, is_active")
    .eq("id", user.id)
    .single();

  const accountType = profile?.account_type as AccountType | undefined;
  const isActive = profile?.is_active === true;
  const hasValidSession = Boolean(accountType && isActive);

  if (!hasValidSession) {
    await supabase.auth.signOut();
    return redirectWithCookies(request, "/login", supabaseResponse);
  }

  // Do not auto-skip /login when cookies exist. Tab unlock is client-side
  // (sessionStorage), so pasted dashboard links in a new tab must re-login.
  if (isLoginPath(pathname)) {
    return supabaseResponse;
  }

  if (isAdminPath(pathname) && accountType !== "lgu") {
    return redirectWithCookies(
      request,
      "/super-admin/dashboard",
      supabaseResponse
    );
  }

  if (isSuperAdminPath(pathname) && accountType !== "company") {
    return redirectWithCookies(request, "/admin/dashboard", supabaseResponse);
  }

  return supabaseResponse;
}

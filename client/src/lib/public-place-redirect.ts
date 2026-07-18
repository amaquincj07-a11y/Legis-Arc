import { NextResponse, type NextRequest } from "next/server";
import {
  PUBLIC_PLACE_COOKIE,
  buildLguPath,
  decodePlaceCookie,
  defaultPlace,
  parseLguPath,
} from "@/lib/lgu-path";

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Map legacy public URLs to /{province}/{municipality}/... SEO paths. */
export function redirectLegacyPublicPlace(
  request: NextRequest
): NextResponse | null {
  const pathname = normalizePath(request.nextUrl.pathname);

  if (parseLguPath(pathname)) return null;

  let rest: string | null = null;
  if (
    pathname === "/" ||
    pathname === "/home" ||
    pathname === "/portal"
  ) {
    rest = "";
  } else {
    const sections = [
      "/ordinances",
      "/resolutions",
      "/minutes",
      "/sbchart",
      "/cso",
      "/search",
    ];
    for (const section of sections) {
      if (pathname === section || pathname.startsWith(`${section}/`)) {
        rest = pathname;
        break;
      }
    }
  }

  if (rest === null) return null;

  const rawCookie = request.cookies.get(PUBLIC_PLACE_COOKIE)?.value;
  let decoded: string | null = null;
  if (rawCookie) {
    try {
      decoded = decodeURIComponent(rawCookie);
    } catch {
      decoded = rawCookie;
    }
  }

  const place = decodePlaceCookie(decoded) ?? defaultPlace();
  const targetPath = buildLguPath(place.province, place.municipality, rest);

  if (targetPath === pathname) return null;

  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  return NextResponse.redirect(url);
}

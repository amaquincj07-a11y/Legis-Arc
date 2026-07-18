import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth-middleware";
import { redirectLegacyPublicPlace } from "@/lib/public-place-redirect";

export async function middleware(request: NextRequest) {
  const placeRedirect = redirectLegacyPublicPlace(request);
  if (placeRedirect) return placeRedirect;
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)",
  ],
};

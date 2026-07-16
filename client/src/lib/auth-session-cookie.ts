import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export { AUTH_COOKIE_NAME };

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function authCookieOptions(maxAge = MAX_AGE_SECONDS) {
  const secure =
    process.env.NODE_ENV === "production" ||
    (process.env.FRONTEND_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith(
      "https"
    );

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

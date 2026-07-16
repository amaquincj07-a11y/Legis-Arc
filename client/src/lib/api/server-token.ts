import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

/** Read the JWT access token from the auth cookie (Server Actions / RSC). */
export async function getServerAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE_NAME)?.value ?? null;
}

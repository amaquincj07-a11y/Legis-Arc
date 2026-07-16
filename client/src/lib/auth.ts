import { ApiError } from "@/lib/api/client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import type { AccountPortal, CompanyAdmin, User } from "./types";

export { AUTH_COOKIE_NAME };
export type LoginResult =
  | {
      success: true;
      portal: AccountPortal;
      redirectTo: string;
      user?: User;
      companyAdmin?: CompanyAdmin;
    }
  | { success: false; error?: string };

type SessionUser = Omit<User, "lastLogin" | "createdAt"> & {
  lastLogin: string | null;
  createdAt: string;
};

type SessionPayload = {
  portal: AccountPortal;
  redirectTo?: string;
  user?: SessionUser;
  companyAdmin?: CompanyAdmin;
};

function normalizeApiUser(user: SessionUser): User {
  return {
    ...user,
    lastLogin: user.lastLogin
      ? new Date(user.lastLogin)
      : new Date(user.createdAt),
    createdAt: new Date(user.createdAt),
  };
}

function mapSession(data: SessionPayload): LoginResult {
  if (data.portal === "company" && data.companyAdmin) {
    return {
      success: true,
      portal: "company",
      redirectTo: data.redirectTo || "/super-admin/dashboard",
      companyAdmin: data.companyAdmin,
    };
  }

  if (data.portal === "lgu" && data.user) {
    return {
      success: true,
      portal: "lgu",
      redirectTo: data.redirectTo || "/admin/dashboard",
      user: normalizeApiUser(data.user),
    };
  }

  return { success: false, error: "Unexpected session response." };
}

/**
 * Login via Next session route (sets HttpOnly cookie) → Express API.
 */
export async function authenticate(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const response = await fetch("/api/auth/session/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      success: boolean;
      data?: SessionPayload;
      error?: string;
    };

    if (!response.ok || !payload.success || !payload.data) {
      return {
        success: false,
        error: payload.error || "Login failed. Please try again.",
      };
    }

    return mapSession(payload.data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
    };
  }
}

/** Load session using HttpOnly cookie (via Next route → Express /me). */
export async function loadSession(): Promise<LoginResult | null> {
  try {
    const response = await fetch("/api/auth/session/", {
      method: "GET",
      cache: "no-store",
    });

    if (response.status === 401) return null;

    const payload = (await response.json()) as {
      success: boolean;
      data?: SessionPayload;
      error?: string;
    };

    if (!response.ok || !payload.success || !payload.data) {
      return null;
    }

    const mapped = mapSession(payload.data);
    return mapped.success ? mapped : null;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/session/", {
      method: "DELETE",
      cache: "no-store",
    });
  } catch {
    /* ignore network errors on logout */
  }
}

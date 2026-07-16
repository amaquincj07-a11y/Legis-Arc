import { apiGetAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import type { User } from "@/lib/types";

export type LguAuthContext = {
  accessToken: string;
  userId: string;
  lguId: string;
  fullName: string;
  email: string;
  isPrimaryAdmin: boolean;
};

type MeResponse = {
  portal: "lgu" | "company";
  user?: User & { lastLogin?: string | Date | null; createdAt?: string | Date };
  profile?: {
    id: string;
    lgu_id: string | null;
    full_name: string;
    email: string;
    is_primary_admin: boolean;
    account_type: string;
  };
};

/**
 * Resolve authenticated LGU staff context from the JWT cookie + /api/auth/me.
 */
export async function getLguAuthContext(): Promise<
  { ok: true; ctx: LguAuthContext } | { ok: false; error: string }
> {
  const accessToken = await getServerAccessToken();
  if (!accessToken) {
    return { ok: false, error: "You must be signed in." };
  }

  try {
    const me = await apiGetAuth<MeResponse>("/api/auth/me", accessToken);
    if (me.portal !== "lgu") {
      return { ok: false, error: "LGU staff access required." };
    }

    const lguId = me.user?.lguId ?? me.profile?.lgu_id ?? null;
    const userId = me.user?.id ?? me.profile?.id;
    if (!lguId || !userId) {
      return { ok: false, error: "LGU staff access required." };
    }

    return {
      ok: true,
      ctx: {
        accessToken,
        userId,
        lguId,
        fullName: me.user?.name ?? me.profile?.full_name ?? "",
        email: me.user?.email ?? me.profile?.email ?? "",
        isPrimaryAdmin:
          me.user?.isPrimaryAdmin ?? me.profile?.is_primary_admin ?? false,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to verify session.",
    };
  }
}

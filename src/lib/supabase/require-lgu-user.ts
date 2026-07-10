"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export type LGUSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  lguId: string;
  fullName: string;
  role: UserRole;
  isPrimaryAdmin: boolean;
};

export async function requireLGUSession(): Promise<
  | { session: LGUSession; error: null }
  | { session: null; error: string }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { session: null, error: "You must be signed in." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "account_type, lgu_id, is_active, role, full_name, is_primary_admin"
      )
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.account_type !== "lgu" ||
      !profile.is_active ||
      !profile.lgu_id ||
      !profile.role
    ) {
      return { session: null, error: "LGU admin access required." };
    }

    return {
      session: {
        supabase,
        userId: user.id,
        lguId: profile.lgu_id,
        fullName: profile.full_name ?? "",
        role: profile.role,
        isPrimaryAdmin: profile.is_primary_admin === true,
      },
      error: null,
    };
  } catch {
    return {
      session: null,
      error: "Unable to verify your session. Please refresh and try again.",
    };
  }
}

export async function requireLGUPrimaryAdmin(): Promise<
  | { session: LGUSession; error: null }
  | { session: null; error: string }
> {
  const result = await requireLGUSession();
  if (result.error || !result.session) {
    return { session: null, error: result.error ?? "LGU admin access required." };
  }
  if (!result.session.isPrimaryAdmin) {
    return {
      session: null,
      error: "Only the primary LGU administrator can manage users.",
    };
  }
  return result;
}

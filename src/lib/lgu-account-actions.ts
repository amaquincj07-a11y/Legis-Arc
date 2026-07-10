"use server";

import { formatPlaceName } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";
import type { LGUClientStatus, SupportPlan, UserRole } from "@/lib/types";

export type LGUAccountProfile = {
  profile: {
    id: string;
    fullName: string;
    email: string;
    position: string;
    mobile: string;
    role: UserRole;
    isPrimaryAdmin: boolean;
    isActive: boolean;
    managedPassword: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
  };
  lgu: {
    id: string;
    province: string;
    municipality: string;
    status: LGUClientStatus;
    streetAddress: string;
    supportPlan: SupportPlan;
    subscriptionAmount: number;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    documentCount: number;
  };
};

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ProfileRow = {
  id: string;
  account_type: "company" | "lgu";
  role: UserRole | null;
  lgu_id: string | null;
  full_name: string;
  email: string;
  position: string | null;
  mobile: string | null;
  is_active: boolean;
  is_primary_admin: boolean;
  managed_password: string | null;
  last_login_at: string | null;
  created_at: string;
};

type LGURow = {
  id: string;
  province: string;
  municipality: string;
  status: LGUClientStatus;
  street_address: string | null;
  support_plan: SupportPlan | null;
  subscription_amount: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  document_count: number;
};

export async function fetchCurrentLGUAccountProfileAction(): Promise<
  ActionResult<LGUAccountProfile>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, account_type, role, lgu_id, full_name, email, position, mobile, is_active, is_primary_admin, managed_password, last_login_at, created_at"
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "Profile not found for this account." };
  }

  const profileRow = profile as ProfileRow;
  if (
    profileRow.account_type !== "lgu" ||
    !profileRow.is_active ||
    !profileRow.role ||
    !profileRow.lgu_id
  ) {
    return {
      success: false,
      error: "This account is not linked to an active registered LGU.",
    };
  }

  const { data: lgu, error: lguError } = await supabase
    .from("lgus")
    .select(
      "id, province, municipality, status, street_address, support_plan, subscription_amount, subscription_start_date, subscription_end_date, document_count"
    )
    .eq("id", profileRow.lgu_id)
    .single();

  if (lguError || !lgu) {
    return { success: false, error: "Registered LGU record was not found." };
  }

  const lguRow = lgu as LGURow;

  return {
    success: true,
    data: {
      profile: {
        id: profileRow.id,
        fullName: profileRow.full_name,
        email: profileRow.email,
        position: profileRow.position ?? "",
        mobile: profileRow.mobile ?? "",
        role: profileRow.role,
        isPrimaryAdmin: profileRow.is_primary_admin === true,
        isActive: profileRow.is_active,
        managedPassword: profileRow.managed_password ?? null,
        lastLoginAt: profileRow.last_login_at
          ? new Date(profileRow.last_login_at)
          : null,
        createdAt: new Date(profileRow.created_at),
      },
      lgu: {
        id: lguRow.id,
        province: formatPlaceName(lguRow.province),
        municipality: formatPlaceName(lguRow.municipality),
        status: lguRow.status,
        streetAddress: lguRow.street_address ?? "",
        supportPlan: lguRow.support_plan ?? "annual",
        subscriptionAmount: Number(lguRow.subscription_amount),
        subscriptionStartDate: lguRow.subscription_start_date
          ? new Date(lguRow.subscription_start_date)
          : null,
        subscriptionEndDate: lguRow.subscription_end_date
          ? new Date(lguRow.subscription_end_date)
          : null,
        documentCount: lguRow.document_count ?? 0,
      },
    },
  };
}

"use server";

import { apiGetAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import { formatPlaceName } from "@/lib/places";
import type {
  LGUClientStatus,
  SupportPlan,
  UserRole,
} from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type LGUAccountProfile = {
  profile: {
    fullName: string;
    position: string;
    role: UserRole;
    email: string;
    mobile: string;
    isPrimaryAdmin: boolean;
    managedPassword?: string;
  };
  lgu: {
    municipality: string;
    province: string;
    streetAddress: string;
    documentCount: number;
    status: LGUClientStatus;
    subscriptionAmount: number;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    supportPlan?: SupportPlan;
  };
};

type AccountApiResponse = {
  id: string;
  email: string;
  full_name: string;
  position: string | null;
  mobile: string | null;
  role: UserRole | null;
  is_primary_admin: boolean;
  managed_password: string | null;
  lgu: {
    id: string;
    province: string;
    municipality: string;
    street_address: string | null;
    status: LGUClientStatus | "pending" | "paid";
    support_plan: SupportPlan | null;
    subscription_amount: string | number;
    subscription_start_date: string | null;
    subscription_end_date: string | null;
    document_count: number;
  } | null;
};

function mapAccountStatus(
  status: LGUClientStatus | "pending" | "paid"
): LGUClientStatus {
  if (status === "pending" || status === "trial") return "trial";
  if (status === "paid") return "active";
  return status;
}

export async function fetchCurrentLGUAccountProfileAction(): Promise<
  ActionResult<LGUAccountProfile>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiGetAuth<AccountApiResponse>(
      "/api/admin/account",
      token
    );

    if (!row.lgu) {
      return {
        success: false,
        error: "The signed-in account is not linked to an LGU record.",
      };
    }

    const status = mapAccountStatus(row.lgu.status);

    return {
      success: true,
      data: {
        profile: {
          fullName: row.full_name,
          position: row.position ?? "",
          role: row.role ?? "sb_member",
          email: row.email,
          mobile: row.mobile ?? "",
          isPrimaryAdmin: row.is_primary_admin,
          managedPassword: row.managed_password ?? undefined,
        },
        lgu: {
          municipality: formatPlaceName(row.lgu.municipality),
          province: formatPlaceName(row.lgu.province),
          streetAddress: row.lgu.street_address ?? "",
          documentCount: row.lgu.document_count ?? 0,
          status,
          subscriptionAmount: Number(row.lgu.subscription_amount ?? 0),
          subscriptionStartDate:
            status === "trial" || !row.lgu.subscription_start_date
              ? null
              : new Date(row.lgu.subscription_start_date),
          subscriptionEndDate:
            status === "trial" || !row.lgu.subscription_end_date
              ? null
              : new Date(row.lgu.subscription_end_date),
          supportPlan: row.lgu.support_plan ?? undefined,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load account.",
    };
  }
}

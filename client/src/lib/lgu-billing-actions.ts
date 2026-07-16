"use server";

import { differenceInCalendarDays, format } from "date-fns";
import { apiGetAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import { SUBSCRIPTION_PLAN_LABEL } from "@/lib/lgu-subscription";
import type {
  BillingHistoryEntry,
  BillingOverview,
  LGUClientStatus,
  LGUPaymentStatus,
} from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type BillingOverviewRow = {
  subscription_amount: string | number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  status: LGUClientStatus | "pending" | "paid";
  support_plan: string | null;
  document_count: number;
};

type BillingHistoryRow = {
  id: string;
  amount: string | number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
};

function mapAccountStatus(
  status: LGUClientStatus | "pending" | "paid"
): LGUClientStatus {
  if (status === "pending" || status === "trial") return "trial";
  if (status === "paid") return "active";
  return status;
}

function mapPaymentStatus(
  start: string | null,
  end: string | null
): LGUPaymentStatus {
  return start && end ? "paid" : "unpaid";
}

export async function fetchLGUBillingOverviewAction(): Promise<
  ActionResult<BillingOverview>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiGetAuth<BillingOverviewRow>(
      "/api/admin/billing/overview",
      token
    );
    const endDate = row.subscription_end_date
      ? new Date(row.subscription_end_date)
      : null;
    const daysRemaining =
      endDate != null
        ? Math.max(0, differenceInCalendarDays(endDate, new Date()))
        : null;

    return {
      success: true,
      data: {
        paymentStatus: mapPaymentStatus(
          row.subscription_start_date,
          row.subscription_end_date
        ),
        accountStatus: mapAccountStatus(row.status),
        subscriptionPlan: SUBSCRIPTION_PLAN_LABEL,
        subscriptionAmount: Number(row.subscription_amount ?? 0),
        expiresOn: endDate,
        daysRemaining,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load billing overview.",
    };
  }
}

export async function fetchLGUBillingHistoryAction(): Promise<
  ActionResult<BillingHistoryEntry[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<BillingHistoryRow[]>(
      "/api/admin/billing/history",
      token
    );
    return {
      success: true,
      data: rows.map((row) => {
        const periodStart = new Date(row.start_date);
        const periodEnd = new Date(row.end_date);
        return {
          id: row.id,
          date: new Date(row.created_at),
          description: `${format(periodStart, "MMM d, yyyy")} – ${format(periodEnd, "MMM d, yyyy")}`,
          amount: Number(row.amount ?? 0),
          periodStart,
          periodEnd,
        };
      }),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load billing history.",
    };
  }
}

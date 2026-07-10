"use server";

import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import {
  getEffectiveLGUStatus,
  getLGUPaymentStatus,
  SUBSCRIPTION_PLAN_LABEL,
} from "@/lib/lgu-subscription";
import { getDaysRemaining } from "@/lib/super-admin";
import type { BillingHistoryEntry, BillingOverview, LGUClientStatus } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type SubscriptionPeriodRow = {
  id: string;
  start_date: string;
  end_date: string;
  amount: number;
  activated_at: string;
};

type LGURow = {
  status: string;
  subscription_amount: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
};

async function requireLGUUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, error: "You must be signed in." as const, lguId: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type, lgu_id, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    profile.account_type !== "lgu" ||
    !profile.is_active ||
    !profile.lgu_id
  ) {
    return {
      supabase,
      error: "LGU admin access required." as const,
      lguId: null,
    };
  }

  return { supabase, error: null, lguId: profile.lgu_id as string };
}

export async function fetchLGUBillingOverviewAction(): Promise<
  ActionResult<BillingOverview>
> {
  const { supabase, error, lguId } = await requireLGUUser();
  if (error || !lguId) return { success: false, error: error ?? "Unauthorized." };

  const { data: lgu, error: lguError } = await supabase
    .from("lgus")
    .select(
      "status, subscription_amount, subscription_start_date, subscription_end_date"
    )
    .eq("id", lguId)
    .single();

  if (lguError || !lgu) {
    return { success: false, error: lguError?.message ?? "LGU not found." };
  }

  const row = lgu as LGURow;
  const subscriptionStartDate = row.subscription_start_date
    ? new Date(row.subscription_start_date)
    : null;
  const subscriptionEndDate = row.subscription_end_date
    ? new Date(row.subscription_end_date)
    : null;

  const clientLike = {
    status: row.status as LGUClientStatus,
    subscriptionStartDate,
    subscriptionEndDate,
  };

  return {
    success: true,
    data: {
      paymentStatus: getLGUPaymentStatus(clientLike),
      accountStatus: getEffectiveLGUStatus(clientLike),
      subscriptionPlan: SUBSCRIPTION_PLAN_LABEL,
      subscriptionAmount: Number(row.subscription_amount),
      expiresOn: subscriptionEndDate,
      daysRemaining: getDaysRemaining(subscriptionEndDate),
    },
  };
}

export async function fetchLGUBillingHistoryAction(): Promise<
  ActionResult<BillingHistoryEntry[]>
> {
  const { supabase, error, lguId } = await requireLGUUser();
  if (error || !lguId) return { success: false, error: error ?? "Unauthorized." };

  const { data, error: queryError } = await supabase
    .from("lgu_subscription_periods")
    .select("id, start_date, end_date, amount, activated_at")
    .eq("lgu_id", lguId)
    .order("activated_at", { ascending: false });

  if (queryError) {
    return { success: false, error: queryError.message };
  }

  const entries = ((data ?? []) as SubscriptionPeriodRow[]).map((period) => {
    const periodStart = new Date(period.start_date);
    const periodEnd = new Date(period.end_date);
    const activatedAt = new Date(period.activated_at);

    return {
      id: period.id,
      date: activatedAt,
      description: `Annual subscription — ${format(periodStart, "MMM d, yyyy")} to ${format(periodEnd, "MMM d, yyyy")}`,
      amount: Number(period.amount),
      periodStart,
      periodEnd,
    };
  });

  return { success: true, data: entries };
}

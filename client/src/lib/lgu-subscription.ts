import { isBefore, startOfDay } from "date-fns";
import type { LGUClient, LGUClientStatus, LGUPaymentStatus } from "./types";

export const SUBSCRIPTION_PLAN_LABEL = "Annual";

/** Free trial length for new LGU accounts (Billing “Expires On”). */
export const TRIAL_DURATION_DAYS = 30;

/** Allowed annual subscription amounts (company-set). */
export const ANNUAL_SUBSCRIPTION_AMOUNTS = [60_000, 5_000] as const;
export const DEFAULT_SUBSCRIPTION_AMOUNT = ANNUAL_SUBSCRIPTION_AMOUNTS[0];

export function hasSubscriptionPeriod(
  client: Pick<LGUClient, "subscriptionStartDate" | "subscriptionEndDate">
): boolean {
  return (
    client.subscriptionStartDate != null && client.subscriptionEndDate != null
  );
}

export function isSubscriptionExpired(
  client: Pick<LGUClient, "subscriptionEndDate">
): boolean {
  if (!client.subscriptionEndDate) return false;
  return isBefore(startOfDay(client.subscriptionEndDate), startOfDay(new Date()));
}

export function isLGUAccessBlocked(
  client: Pick<LGUClient, "status">
): boolean {
  return client.status === "suspended";
}

export function getEffectiveLGUStatus(
  client: Pick<
    LGUClient,
    "status" | "subscriptionStartDate" | "subscriptionEndDate"
  >
): LGUClientStatus {
  if (client.status === "suspended") return "suspended";
  if (!hasSubscriptionPeriod(client)) return "trial";
  if (isSubscriptionExpired(client)) return "expired";
  return "active";
}

export function getLGUPaymentStatus(
  client: Pick<LGUClient, "subscriptionStartDate" | "subscriptionEndDate">
): LGUPaymentStatus {
  return hasSubscriptionPeriod(client) ? "paid" : "unpaid";
}

export function resolveStatusAfterUnblock(
  client: Pick<LGUClient, "subscriptionStartDate" | "subscriptionEndDate">
): Exclude<LGUClientStatus, "suspended"> {
  if (!hasSubscriptionPeriod(client)) return "trial";
  if (isSubscriptionExpired(client)) return "expired";
  return "active";
}

import { differenceInDays, isAfter, isBefore, addDays } from "date-fns";
import {
  getEffectiveLGUStatus,
  hasSubscriptionPeriod,
  isLGUAccessBlocked,
} from "./lgu-subscription";
import type { LGUClient, SuperAdminDashboardStats } from "./types";

const EXPIRING_WINDOW_DAYS = 30;

export {
  getEffectiveLGUStatus,
  hasSubscriptionPeriod,
  isLGUAccessBlocked,
} from "./lgu-subscription";

export function getDaysRemaining(endDate: Date | null): number | null {
  if (!endDate) return null;
  return Math.max(0, differenceInDays(endDate, new Date()));
}

export function isExpiringSoon(endDate: Date | null): boolean {
  if (!endDate) return false;
  const now = new Date();
  const windowEnd = addDays(now, EXPIRING_WINDOW_DAYS);
  return isAfter(endDate, now) && isBefore(endDate, windowEnd);
}

export function isLGUActive(client: LGUClient): boolean {
  return !isLGUAccessBlocked(client);
}

export function getSuperAdminDashboardStats(
  clients: LGUClient[]
): SuperAdminDashboardStats {
  return {
    activeLGUs: clients.filter(isLGUActive).length,
    paid: clients.filter((c) => hasSubscriptionPeriod(c)).length,
    trial: clients.filter((c) => getEffectiveLGUStatus(c) === "trial").length,
    expiringSoon: clients.filter(
      (c) =>
        hasSubscriptionPeriod(c) &&
        isExpiringSoon(c.subscriptionEndDate) &&
        isAfter(c.subscriptionEndDate!, new Date())
    ).length,
    revenue: clients
      .filter((c) => hasSubscriptionPeriod(c))
      .reduce((sum, c) => sum + c.subscriptionAmount, 0),
    documents: clients.reduce((sum, c) => sum + c.documentCount, 0),
  };
}

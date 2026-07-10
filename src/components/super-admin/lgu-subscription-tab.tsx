"use client";

import { format, addYears } from "date-fns";
import { toast } from "sonner";
import { Building2, CalendarDays, Loader2, BadgeCheck, ShieldBan, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { LGUClient } from "@/lib/types";
import {
  getEffectiveLGUStatus,
  hasSubscriptionPeriod,
  isLGUAccessBlocked,
  isSubscriptionExpired,
  SUBSCRIPTION_PLAN_LABEL,
} from "@/lib/lgu-subscription";
import { getDaysRemaining } from "@/lib/super-admin";
import { useSuperAdminLGUs } from "@/lib/super-admin-lgu-context";
import { LGUStatusBadge } from "@/components/super-admin/lgu-status-badge";
import { formatPeso } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LGUSubscriptionTabProps = {
  client: LGUClient;
  onUpdate: (updated: LGUClient) => void;
};

export function LGUSubscriptionTab({ client, onUpdate }: LGUSubscriptionTabProps) {
  const {
    updateClientSubscription,
    activatePaidSubscriptionToday,
    blockLGUAccess,
    unblockLGUAccess,
  } = useSuperAdminLGUs();
  const [isUpdating, setIsUpdating] = useState(false);

  const effectiveStatus = getEffectiveLGUStatus(client);
  const daysRemaining = getDaysRemaining(client.subscriptionEndDate);
  const isBlocked = isLGUAccessBlocked(client);
  const canActivateToday =
    !isBlocked &&
    (!hasSubscriptionPeriod(client) || isSubscriptionExpired(client));

  async function applyUpdate(patch: Parameters<typeof updateClientSubscription>[1], recordPeriod = false) {
    setIsUpdating(true);
    const updated = await updateClientSubscription(client.id, patch, recordPeriod);
    setIsUpdating(false);

    if (!updated) {
      toast.error("Failed to update subscription");
      return;
    }

    onUpdate(updated);
    return updated;
  }

  async function handleActivatePaidToday() {
    setIsUpdating(true);
    const updated = await activatePaidSubscriptionToday(client.id);
    setIsUpdating(false);

    if (!updated) {
      toast.error("Failed to activate paid subscription");
      return;
    }

    onUpdate(updated);
    toast.success(
      `${client.municipality} is now Active through ${format(updated.subscriptionEndDate!, "MMMM d, yyyy")}`
    );
  }

  async function handleRenew() {
    if (!client.subscriptionEndDate) {
      toast.error("Activate a paid subscription before renewing.");
      return;
    }

    const newEnd = addYears(client.subscriptionEndDate, 1);
    const updated = await applyUpdate(
      {
        status: "active",
        subscriptionStartDate: client.subscriptionEndDate,
        subscriptionEndDate: newEnd,
      },
      true
    );
    if (updated) {
      toast.success(`${client.municipality} subscription renewed for 1 year`);
    }
  }

  async function handleBlockAccess() {
    setIsUpdating(true);
    const updated = await blockLGUAccess(client.id);
    setIsUpdating(false);

    if (!updated) {
      toast.error("Failed to block LGU access");
      return;
    }

    onUpdate(updated);
    toast.warning(`${client.municipality} access has been blocked`);
  }

  async function handleUnblockAccess() {
    setIsUpdating(true);
    const updated = await unblockLGUAccess(client.id);
    setIsUpdating(false);

    if (!updated) {
      toast.error("Failed to restore LGU access");
      return;
    }

    onUpdate(updated);
    toast.success(`${client.municipality} access has been restored`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscription Details</CardTitle>
        <CardDescription>
          Trial LGUs can use the system before payment. Activate when paid to
          start the annual period. Expired accounts stay accessible until you
          block them manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <Building2 className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Client
            </span>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">LGU</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {client.municipality}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Province</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {client.province}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Subscription Plan</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {SUBSCRIPTION_PLAN_LABEL}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Account Status</dt>
              <dd className="mt-1">
                <LGUStatusBadge status={effectiveStatus} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Billing Period
            </span>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Amount</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
                {formatPeso(client.subscriptionAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Days Remaining</dt>
              <dd
                className={`mt-0.5 text-lg font-semibold tabular-nums ${
                  daysRemaining != null && daysRemaining <= 30
                    ? "text-orange-600"
                    : "text-slate-900"
                }`}
              >
                {daysRemaining != null ? `${daysRemaining} days` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Date Started</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {client.subscriptionStartDate
                  ? format(client.subscriptionStartDate, "MMMM d, yyyy")
                  : "Not started"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Date Ended</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {client.subscriptionEndDate
                  ? format(client.subscriptionEndDate, "MMMM d, yyyy")
                  : "Not started"}
              </dd>
            </div>
          </dl>
        </div>

        {effectiveStatus === "trial" ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 size-4 shrink-0" />
              <p>
                This LGU is on Trial — users can access the system and add staff
                before payment. Click activate on the day payment is received.
              </p>
            </div>
          </div>
        ) : null}

        {effectiveStatus === "expired" && !isBlocked ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p>
              This subscription has expired. The LGU can still log in until you
              block access manually, or activate a new paid period.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            onClick={() => void handleActivatePaidToday()}
            disabled={!canActivateToday || isUpdating}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isUpdating ? <Loader2 className="size-4 animate-spin" /> : null}
            Activate Paid Subscription (Today)
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleRenew()}
            disabled={
              !hasSubscriptionPeriod(client) ||
              isSubscriptionExpired(client) ||
              isUpdating
            }
          >
            Renew
          </Button>
          {isBlocked ? (
            <Button
              variant="outline"
              onClick={() => void handleUnblockAccess()}
              disabled={isUpdating}
              className="gap-1.5"
            >
              <ShieldCheck className="size-4" />
              Restore Access
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => void handleBlockAccess()}
              disabled={isUpdating}
              className="gap-1.5"
            >
              <ShieldBan className="size-4" />
              Block Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { format } from "date-fns";
import { CalendarDays, BadgeCheck, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchLGUBillingOverviewAction } from "@/lib/lgu-billing-actions";
import { LGUStatusBadge } from "@/components/super-admin/lgu-status-badge";
import { formatPeso } from "@/lib/utils";
import { TRIAL_DURATION_DAYS } from "@/lib/lgu-subscription";
import type { BillingOverview } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BillingOverview() {
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await fetchLGUBillingOverviewAction();
      if (cancelled) return;

      if (!result.success) {
        setError(result.error);
        setOverview(null);
      } else {
        setError(null);
        setOverview(result.data);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !overview) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {error ?? "Unable to load billing information."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscription Summary</CardTitle>
        <CardDescription>
          Billing details managed by LegisArc — matches your company admin
          account records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <BadgeCheck className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Payment Status
              </span>
            </div>
            <p className="text-sm font-semibold capitalize text-slate-900">
              {overview.paymentStatus}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Account Status
              </span>
            </div>
            <LGUStatusBadge status={overview.accountStatus} />
          </div>

          {overview.accountStatus !== "trial" ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Subscription Plan
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {overview.subscriptionPlan}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatPeso(overview.subscriptionAmount)} per year
              </p>
            </div>
          ) : null}

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Expires On
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {overview.expiresOn
                ? format(overview.expiresOn, "MMMM d, yyyy")
                : "Not activated yet"}
            </p>
            {overview.daysRemaining != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {overview.accountStatus === "trial"
                  ? `${overview.daysRemaining} of ${TRIAL_DURATION_DAYS} trial days remaining`
                  : `${overview.daysRemaining} days remaining`}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

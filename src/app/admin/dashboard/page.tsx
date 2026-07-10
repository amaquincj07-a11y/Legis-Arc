"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ScrollText,
  FileText,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchDashboardStatsAction,
  type DashboardStats,
} from "@/lib/dashboard-actions";
import { ADMIN_CACHE_KEYS } from "@/lib/admin-query-cache";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const emptyStats: DashboardStats = {
  ordinanceCount: 0,
  resolutionCount: 0,
  minutesCount: 0,
  totalDocuments: 0,
  categoryBreakdown: [],
};

export default function DashboardPage() {
  const { data, loading, error } = useAdminQuery(
    ADMIN_CACHE_KEYS.dashboard,
    fetchDashboardStatsAction
  );

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const stats = data ?? emptyStats;

  const maxCategoryCount = useMemo(
    () =>
      Math.max(...stats.categoryBreakdown.map((category) => category.count), 1),
    [stats.categoryBreakdown]
  );

  const typeSummary = useMemo(
    () => [
      {
        label: "Ordinances",
        count: stats.ordinanceCount,
        icon: ScrollText,
        href: "/admin/ordinances",
      },
      {
        label: "Resolutions",
        count: stats.resolutionCount,
        icon: FileText,
        href: "/admin/resolutions",
      },
      {
        label: "Minutes",
        count: stats.minutesCount,
        icon: BookOpen,
        href: "/admin/minutes",
      },
    ],
    [stats.ordinanceCount, stats.resolutionCount, stats.minutesCount]
  );

  const maxTypeCount = Math.max(...typeSummary.map((item) => item.count), 1);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#3998eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-[26px]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          High-level snapshot of legislative activity and document counts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
        {typeSummary.map((item) => {
          const Icon = item.icon;
          const percentage = (item.count / maxTypeCount) * 100;
          return (
            <Link key={item.label} href={item.href} className="block">
              <Card className="border border-slate-200/90 shadow-sm shadow-slate-900/5 transition-colors hover:border-[#3998eb]/40">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {item.label}
                    </p>
                    <CardTitle className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">
                      {item.count}
                    </CardTitle>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#cbab53]/10 text-[#cbab53]">
                    <Icon className="size-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Share of total</span>
                    <span className="font-medium text-slate-700">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#3998eb] transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="border border-slate-200/90 shadow-sm shadow-slate-900/5">
          <CardHeader className="pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Ordinances by Category
            </h2>
          </CardHeader>
          <CardContent>
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ordinances uploaded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat) => {
                  const percentage = (cat.count / maxCategoryCount) * 100;
                  return (
                    <div key={cat.name} className="flex items-center gap-4">
                      <span className="w-40 truncate text-xs font-medium text-slate-600">
                        {cat.name}
                      </span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#3998eb] transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-slate-800 tabular-nums">
                        {cat.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/90 shadow-sm shadow-slate-900/5">
          <CardHeader className="pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Total Documents
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-semibold text-slate-900 tabular-nums">
              {stats.totalDocuments}
            </p>
            <p className="text-xs text-slate-500">
              Combined count of ordinances, resolutions, and minutes in the
              system.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

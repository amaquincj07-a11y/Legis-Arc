"use client";

import {
  Building2,
  BadgeCheck,
  Clock,
  AlertTriangle,
  Banknote,
  FileStack,
} from "lucide-react";
import { getSuperAdminDashboardStats } from "@/lib/super-admin";
import { useSuperAdminLGUs } from "@/lib/super-admin-lgu-context";
import { formatPeso } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statCards = [
  {
    key: "activeLGUs" as const,
    title: "Active LGUs",
    icon: Building2,
    accent: "text-emerald-600 bg-emerald-50",
    format: (v: number) => String(v),
  },
  {
    key: "paid" as const,
    title: "Paid",
    icon: BadgeCheck,
    accent: "text-blue-600 bg-blue-50",
    format: (v: number) => String(v),
  },
  {
    key: "trial" as const,
    title: "Trial",
    icon: Clock,
    accent: "text-amber-600 bg-amber-50",
    format: (v: number) => String(v),
  },
  {
    key: "expiringSoon" as const,
    title: "Expiring Soon",
    icon: AlertTriangle,
    accent: "text-orange-600 bg-orange-50",
    format: (v: number) => String(v),
    description: "Within 30 days",
  },
  {
    key: "revenue" as const,
    title: "Revenue",
    icon: Banknote,
    accent: "text-violet-600 bg-violet-50",
    format: (v: number) => formatPeso(v),
  },
  {
    key: "documents" as const,
    title: "Documents",
    icon: FileStack,
    accent: "text-slate-600 bg-slate-100",
    format: (v: number) => v.toLocaleString("en-PH"),
  },
];

export function DashboardStats() {
  const { clients } = useSuperAdminLGUs();
  const stats = getSuperAdminDashboardStats(clients);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];

        return (
          <Card
            key={card.key}
            className="border border-slate-200/90 shadow-sm shadow-slate-900/5"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  {card.title}
                </p>
                <CardTitle className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">
                  {card.format(value)}
                </CardTitle>
                {card.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                )}
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${card.accent}`}
              >
                <Icon className="size-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0" />
          </Card>
        );
      })}
    </div>
  );
}

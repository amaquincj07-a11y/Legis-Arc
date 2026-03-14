"use client";

import { useMemo } from "react";
import {
  ScrollText,
  FileText,
  BookOpen,
} from "lucide-react";
import {
  mockOrdinances,
  mockResolutions,
  mockMinutes,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Referral Types
const REFERRAL_TYPES = [
  { value: "letter", label: "Letter" },
  { value: "brgy_resolution", label: "Brgy Resolution" },
  { value: "brgy_ordinance", label: "Brgy Ordinance" },
  { value: "subd_application", label: "Subd Application" },
  { value: "accreditation", label: "Accreditation" },
  { value: "board_council_resolutions", label: "Board/Council Resolutions" },
  { value: "memorandum", label: "Memorandum" },
  { value: "executive_orders", label: "Executive Orders" },
  { value: "draft_resolutions", label: "Draft Resolutions" },
  { value: "draft_ordinance", label: "Draft Ordinance" },
  { value: "others", label: "Others" },
];

// Tracking Statuses
const TRACKING_STATUSES = [
  { value: "for_referral", label: "For referral" },
  { value: "under_committee", label: "Under committee" },
  { value: "for_public_hearing", label: "For public hearing" },
  { value: "for_committee_report", label: "For committee report" },
  { value: "for_signature", label: "For signature" },
  { value: "for_approval", label: "For approval" },
  { value: "for_reporting", label: "For reporting" },
  { value: "others", label: "Others" },
];

const allDocuments = [...mockOrdinances, ...mockResolutions, ...mockMinutes];

export default function DashboardPage() {
  const categoryDistribution = useMemo(() => {
    const categories = [
      "Social Services",
      "Taxation",
      "Land Use",
      "Education",
      "Tourism",
      "Environment",
      "Health",
      "Infrastructure",
      "Peace and Order",
      "General",
    ];
    const counts = categories.map((cat) => ({
      name: cat,
      count: mockOrdinances.filter((d) => d.category === cat).length,
    }));
    return counts.sort((a, b) => b.count - a.count);
  }, []);

  const maxCategoryCount = Math.max(
    ...categoryDistribution.map((c) => c.count),
    1
  );

  const typeSummary = [
    {
      label: "Ordinances",
      count: mockOrdinances.length,
      icon: ScrollText,
    },
    {
      label: "Resolutions",
      count: mockResolutions.length,
      icon: FileText,
    },
    {
      label: "Minutes",
      count: mockMinutes.length,
      icon: BookOpen,
    },
  ];

  const maxTypeCount = Math.max(...typeSummary.map((item) => item.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          High-level snapshot of legislative activity and document tracking.
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {typeSummary.map((item) => {
          const Icon = item.icon;
          const percentage = (item.count / maxTypeCount) * 100;
          return (
            <Card
              key={item.label}
              className="border border-slate-200/90 shadow-sm shadow-slate-900/5"
            >
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
          );
        })}
      </div>

      {/* Middle section: categories + overall total */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="border border-slate-200/90 shadow-sm shadow-slate-900/5">
          <CardHeader className="pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Ordinances by Category
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryDistribution.map((cat) => {
                const percentage = (cat.count / maxCategoryCount) * 100;
                return (
                  <div key={cat.name} className="flex items-center gap-4">
                    <span className="w-40 text-xs font-medium text-slate-600">
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
              {allDocuments.length}
            </p>
            <p className="text-xs text-slate-500">
              Combined count of ordinances, resolutions, and minutes in the
              system.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Document by Referral Type & Status Charts */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Legislative Tracking
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Document by Referral Type */}
          <Card className="border border-slate-200/90 shadow-sm shadow-slate-900/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Document by Referral Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const referralCounts: Record<string, number> = {};
                allDocuments.forEach((doc) => {
                  if ("referralType" in doc) {
                    const refType = doc.referralType || "others";
                    referralCounts[refType] =
                      (referralCounts[refType] || 0) + 1;
                  }
                });

                const maxCount = Math.max(...Object.values(referralCounts), 1);

                return REFERRAL_TYPES.map((type) => {
                  const count = referralCounts[type.value] || 0;
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={type.value} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{type.label}</span>
                        <span className="font-semibold text-slate-800">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#3998eb] transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>

          {/* Document by Tracking Status */}
          <Card className="border border-slate-200/90 shadow-sm shadow-slate-900/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Document Tracking Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const statusCounts: Record<string, number> = {};
                allDocuments.forEach((doc) => {
                  if ("stage" in doc) {
                    const status = doc.stage || "others";
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                  }
                });

                const maxCount = Math.max(...Object.values(statusCounts), 1);

                return TRACKING_STATUSES.map((status) => {
                  const count = statusCounts[status.value] || 0;
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={status.value} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{status.label}</span>
                        <span className="font-semibold text-slate-800">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#3998eb] transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-border" />;
}

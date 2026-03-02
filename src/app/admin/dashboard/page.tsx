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

  const maxCount = Math.max(
    ...categoryDistribution.map((c) => c.count),
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the legislative records management system.
        </p>
      </div>

      <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Documents by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const items = [
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
                const maxCount = Math.max(...items.map((item) => item.count), 1);
                
                return items.map((item) => {
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                        <item.icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className="text-sm font-semibold">{item.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold tabular-nums">
                  {allDocuments.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Ordinances by Category</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryDistribution.map((cat) => {
              const percentage = (cat.count / maxCount) * 100;
              return (
                <div key={cat.name} className="flex items-center gap-4">
                  <span className="w-32 text-sm font-medium text-muted-foreground">
                    {cat.name}
                  </span>
                  <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium">
                    {cat.count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Document by Referral Type & Status Charts */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Legislative Tracking</h2>
        <div className="grid gap-6 md:grid-cols-2">
        {/* Document by Referral Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Document by Referral Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const referralCounts: Record<string, number> = {};
              allDocuments.forEach((doc) => {
                if ('referralType' in doc) {
                  const refType = doc.referralType || "others";
                  referralCounts[refType] = (referralCounts[refType] || 0) + 1;
                }
              });
              
              const maxCount = Math.max(...Object.values(referralCounts), 1);
              
              return REFERRAL_TYPES.map((type) => {
                const count = referralCounts[type.value] || 0;
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={type.value} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{type.label}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Document Tracking Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const statusCounts: Record<string, number> = {};
              allDocuments.forEach((doc) => {
                if ('stage' in doc) {
                  const status = doc.stage || "others";
                  statusCounts[status] = (statusCounts[status] || 0) + 1;
                }
              });
              
              const maxCount = Math.max(...Object.values(statusCounts), 1);
              
              return TRACKING_STATUSES.map((status) => {
                const count = statusCounts[status.value] || 0;
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={status.value} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{status.label}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
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

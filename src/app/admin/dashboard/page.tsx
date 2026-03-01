"use client";

import {
  ScrollText,
  FileText,
  BookOpen,
  Clock,
  FilePen,
  Globe,
  CalendarPlus,
} from "lucide-react";
import { format, isThisMonth } from "date-fns";
import {
  mockOrdinances,
  mockResolutions,
  mockMinutes,
  mockAuditLogs,
} from "@/lib/mock-data";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
const draftCount = allDocuments.filter((d) => d.status === "draft").length;
const publishedCount = allDocuments.filter(
  (d) => d.status === "published"
).length;
const thisMonthUploads = allDocuments.filter((d) =>
  isThisMonth(d.createdAt)
).length;
const pendingDraftCount = allDocuments.filter(
  (d) => d.status === "draft" || d.status === "approved"
).length;

const recentLogs = mockAuditLogs.slice(0, 10);

const actionVariant: Record<string, "default" | "secondary" | "outline"> = {
  upload: "default",
  publish: "default",
  edit: "secondary",
  login: "outline",
  logout: "outline",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the legislative records management system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Ordinances"
          value={mockOrdinances.length}
          icon={ScrollText}
          href="/admin/ordinances"
        />
        <StatCard
          title="Total Resolutions"
          value={mockResolutions.length}
          icon={FileText}
          href="/admin/resolutions"
        />
        <StatCard
          title="Total Minutes"
          value={mockMinutes.length}
          icon={BookOpen}
          href="/admin/minutes"
        />
        <StatCard
          title="Pending / Draft"
          value={pendingDraftCount}
          icon={Clock}
          href="/admin/tracking"
          description="Drafts and awaiting publication"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Drafts"
          value={draftCount}
          icon={FilePen}
          href="/admin/tracking"
        />
        <StatCard
          title="Published"
          value={publishedCount}
          icon={Globe}
          href="/admin/tracking"
        />
        <StatCard
          title="This Month"
          value={thisMonthUploads}
          icon={CalendarPlus}
          href="/admin/audit-logs"
          description="Documents uploaded this month"
        />
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">
                  Document
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground">
                    {format(log.timestamp, "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionVariant[log.action] ?? "secondary"}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.userName}</TableCell>
                  <TableCell className="hidden max-w-[240px] truncate md:table-cell">
                    {log.documentTitle ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Documents by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["draft", "approved", "published", "archived"] as const).map(
                (status) => {
                  const count = allDocuments.filter(
                    (d) => d.status === status
                  ).length;
                  const percent =
                    allDocuments.length > 0
                      ? Math.round((count / allDocuments.length) * 100)
                      : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <StatusBadge status={status} className="w-24 justify-center" />
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-10 text-right text-sm font-medium tabular-nums">
                        {count}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Documents by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
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
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <item.icon className="size-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-sm">{item.label}</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
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
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-border" />;
}

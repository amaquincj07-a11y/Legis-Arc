"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, getYear, getMonth } from "date-fns";
import {
  ChevronRight,
  Eye,
  Pencil,
  Download,
  Trash2,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUploadTrigger } from "@/components/admin/admin-upload-trigger";
import {
  AdminActionsMenu,
  type AdminActionItem,
} from "@/components/admin/admin-actions-menu";
import { PublicVisibilityBadge } from "@/components/admin/public-visibility-badge";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { createPublishVisibilityAction } from "@/lib/admin-document-visibility";
import {
  deleteSessionMinutesAction,
  fetchSessionMinutesAction,
  toggleSessionMinutesPublishAction,
} from "@/lib/minutes-actions";
import { ADMIN_CACHE_KEYS, invalidateAdminCache } from "@/lib/admin-query-cache";
import { openMinutesPdf } from "@/lib/admin-document-pdf";
import { useAdminQuery } from "@/hooks/use-admin-query";
import type { SessionMinutes } from "@/lib/types";
import { toast } from "sonner";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type GroupedMinutes = Record<number, Record<number, SessionMinutes[]>>;

export default function MinutesPage() {
  const router = useRouter();
  const {
    data,
    loading,
    setData: setSessions,
  } = useAdminQuery(ADMIN_CACHE_KEYS.minutes, fetchSessionMinutesAction);
  const sessions = data ?? [];
  const [openYears, setOpenYears] = useState<Set<number>>(new Set());
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<SessionMinutes | null>(null);

  const grouped = useMemo(() => {
    const result: GroupedMinutes = {};
    for (const min of sessions) {
      const year = getYear(min.sessionDate);
      const month = getMonth(min.sessionDate);
      if (!result[year]) result[year] = {};
      if (!result[year][month]) result[year][month] = [];
      result[year][month].push(min);
    }
    return result;
  }, [sessions]);

  const sortedYears = useMemo(
    () => Object.keys(grouped).map(Number).sort((a, b) => b - a),
    [grouped]
  );

  useEffect(() => {
    if (sortedYears.length > 0 && openYears.size === 0) {
      const latestYear = sortedYears[0];
      setOpenYears(new Set([latestYear]));
      const months = Object.keys(grouped[latestYear]).map(Number);
      if (months.length > 0) {
        const latestMonth = Math.max(...months);
        setOpenMonths(new Set([`${latestYear}-${latestMonth}`]));
      }
    }
  }, [sortedYears, grouped, openYears.size]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    const result = await deleteSessionMinutesAction(deleteTarget.id);
    if (result.success) {
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      invalidateAdminCache(ADMIN_CACHE_KEYS.dashboard);
      toast.success(
        `Session minutes for ${format(deleteTarget.sessionDate, "MMMM d, yyyy")} deleted`
      );
      setDeleteTarget(null);
    } else {
      toast.error(result.error);
    }
  }

  function toggleYear(year: number) {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  function toggleMonth(key: string) {
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const getSessionActions = useCallback(
    (session: SessionMinutes): AdminActionItem[] => [
      {
        label: "Edit",
        icon: Pencil,
        onClick: () => router.push(`/admin/minutes/${session.id}/edit`),
      },
      {
        label: "Download PDF",
        icon: Download,
        onClick: () =>
          void openMinutesPdf(
            session.id,
            `minutes-${format(session.sessionDate, "yyyy-MM-dd")}`,
            "download"
          ),
      },
      {
        label: "View PDF",
        icon: Eye,
        onClick: () =>
          void openMinutesPdf(
            session.id,
            `minutes-${format(session.sessionDate, "yyyy-MM-dd")}`,
            "view"
          ),
      },
      createPublishVisibilityAction(session, async () => {
        const result = await toggleSessionMinutesPublishAction(session.id);
        if (result.success) {
          setSessions((prev) =>
            prev.map((item) =>
              item.id === session.id ? result.data : item
            )
          );
          toast.success(
            result.data.isPublic && result.data.status === "published"
              ? "Session minutes published to public portal"
              : "Session minutes removed from public portal"
          );
        } else {
          toast.error(result.error);
        }
      }),
      {
        label: "Delete",
        icon: Trash2,
        destructive: true,
        separatorBefore: true,
        onClick: () => setDeleteTarget(session),
      },
    ],
    [router]
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <AdminPageHeader
          title="Session Minutes"
          description="Browse and manage session minutes by year and month"
        >
          <AdminUploadTrigger
            label="Upload Minutes"
            documentLabel="Session Minutes"
            uploadHref="/admin/minutes/new"
            scanHref="/admin/minutes/scan"
          />
        </AdminPageHeader>
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading session minutes...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Session Minutes"
        description="Browse and manage session minutes by year and month"
      >
        <AdminUploadTrigger
          label="Upload Minutes"
          documentLabel="Session Minutes"
          uploadHref="/admin/minutes/new"
          scanHref="/admin/minutes/scan"
        />
      </AdminPageHeader>

      <div className="space-y-3">
        {sortedYears.map((year) => {
          const months = Object.keys(grouped[year])
            .map(Number)
            .sort((a, b) => b - a);

          return (
            <Card key={year}>
              <Collapsible
                open={openYears.has(year)}
                onOpenChange={() => toggleYear(year)}
              >
                <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50 sm:px-6">
                  <ChevronRight
                    className={`size-4 text-muted-foreground transition-transform ${
                      openYears.has(year) ? "rotate-90" : ""
                    }`}
                  />
                  <CalendarDays className="size-5 text-primary" />
                  <span className="text-lg font-semibold">{year}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {Object.values(grouped[year]).flat().length} sessions
                  </Badge>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t">
                    {months.map((month) => {
                      const monthKey = `${year}-${month}`;
                      const monthSessions = grouped[year][month].sort(
                        (a, b) =>
                          b.sessionDate.getTime() - a.sessionDate.getTime()
                      );

                      return (
                        <Collapsible
                          key={monthKey}
                          open={openMonths.has(monthKey)}
                          onOpenChange={() => toggleMonth(monthKey)}
                        >
                          <CollapsibleTrigger className="flex w-full items-center gap-3 border-b px-4 py-3 pl-8 text-left transition-colors last:border-b-0 hover:bg-muted/50 sm:px-6 sm:pl-12">
                            <ChevronRight
                              className={`size-3.5 text-muted-foreground transition-transform ${
                                openMonths.has(monthKey) ? "rotate-90" : ""
                              }`}
                            />
                            <span className="font-medium">
                              {MONTH_NAMES[month]}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({monthSessions.length} session
                              {monthSessions.length !== 1 ? "s" : ""})
                            </span>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="divide-y bg-muted/30">
                              {monthSessions.map((session) => (
                                <div
                                  key={session.id}
                                  className="flex flex-col gap-3 px-4 py-3 pl-8 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:pl-20"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {format(
                                          session.sessionDate,
                                          "MMMM d, yyyy"
                                        )}
                                      </span>
                                      <Badge
                                        variant={
                                          session.sessionType === "special"
                                            ? "default"
                                            : "outline"
                                        }
                                        className="text-xs"
                                      >
                                        {session.sessionType === "regular"
                                          ? "Regular"
                                          : "Special"}
                                      </Badge>
                                      <PublicVisibilityBadge
                                        status={session.status}
                                        isPublic={session.isPublic}
                                      />
                                    </div>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                      {format(
                                        session.sessionDate,
                                        "EEEE, MMMM d, yyyy"
                                      )}
                                    </p>
                                  </div>

                                  <AdminActionsMenu items={getSessionActions(session)} />
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}

        {sortedYears.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground">
                No session minutes found.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/admin/minutes/new">Upload Minutes</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete session minutes?"
        description={
          deleteTarget
            ? `Minutes for ${format(deleteTarget.sessionDate, "MMMM d, yyyy")} (${deleteTarget.sessionType}) will be permanently removed.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}

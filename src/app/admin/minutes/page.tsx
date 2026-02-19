"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, getYear, getMonth } from "date-fns";
import {
  Plus,
  ChevronRight,
  Eye,
  Pencil,
  Download,
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
import { StatusBadge } from "@/components/admin/status-badge";
import { mockMinutes } from "@/lib/mock-data";
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
  const [openYears, setOpenYears] = useState<Set<number>>(new Set());
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const result: GroupedMinutes = {};
    for (const min of mockMinutes) {
      const year = getYear(min.sessionDate);
      const month = getMonth(min.sessionDate);
      if (!result[year]) result[year] = {};
      if (!result[year][month]) result[year][month] = [];
      result[year][month].push(min);
    }
    return result;
  }, []);

  const sortedYears = useMemo(
    () => Object.keys(grouped).map(Number).sort((a, b) => b - a),
    [grouped]
  );

  // Auto-open the most recent year and month on mount
  useMemo(() => {
    if (sortedYears.length > 0) {
      const latestYear = sortedYears[0];
      setOpenYears(new Set([latestYear]));
      const months = Object.keys(grouped[latestYear]).map(Number);
      if (months.length > 0) {
        const latestMonth = Math.max(...months);
        setOpenMonths(new Set([`${latestYear}-${latestMonth}`]));
      }
    }
  }, [sortedYears, grouped]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Session Minutes
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage session minutes by year and month
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/minutes/new">
            <Plus className="mr-2 size-4" />
            Upload Minutes
          </Link>
        </Button>
      </div>

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
                <CollapsibleTrigger className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-muted/50 transition-colors">
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
                      const sessions = grouped[year][month].sort(
                        (a, b) =>
                          b.sessionDate.getTime() - a.sessionDate.getTime()
                      );

                      return (
                        <Collapsible
                          key={monthKey}
                          open={openMonths.has(monthKey)}
                          onOpenChange={() => toggleMonth(monthKey)}
                        >
                          <CollapsibleTrigger className="flex w-full items-center gap-3 px-6 py-3 pl-12 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0">
                            <ChevronRight
                              className={`size-3.5 text-muted-foreground transition-transform ${
                                openMonths.has(monthKey) ? "rotate-90" : ""
                              }`}
                            />
                            <span className="font-medium">
                              {MONTH_NAMES[month]}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({sessions.length} session
                              {sessions.length !== 1 ? "s" : ""})
                            </span>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="divide-y bg-muted/30">
                              {sessions.map((session) => (
                                <div
                                  key={session.id}
                                  className="flex items-center gap-4 px-6 py-3 pl-20"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">
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
                                      <StatusBadge status={session.status} />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Session No. {session.sessionNumber}
                                      {session.remarks &&
                                        ` — ${session.remarks}`}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      onClick={() =>
                                        router.push(
                                          `/admin/minutes/${session.id}`
                                        )
                                      }
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      onClick={() =>
                                        router.push(
                                          `/admin/minutes/${session.id}/edit`
                                        )
                                      }
                                    >
                                      <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      onClick={() =>
                                        toast.info("Download started")
                                      }
                                    >
                                      <Download className="size-4" />
                                    </Button>
                                  </div>
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
    </div>
  );
}

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
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
    const groupedMinutes: GroupedMinutes = {};
    mockMinutes.forEach((minute) => {
      const year = getYear(new Date(minute.sessionDate));
      const month = getMonth(new Date(minute.sessionDate));

      if (!groupedMinutes[year]) {
        groupedMinutes[year] = {};
      }

      if (!groupedMinutes[year][month]) {
        groupedMinutes[year][month] = [];
      }

      groupedMinutes[year][month].push(minute);
    });

    // Sort sessions within each month by date (newest first)
    Object.keys(groupedMinutes).forEach((year) => {
      const yearNum = Number(year);
      Object.keys(groupedMinutes[yearNum]).forEach((month) => {
        const monthNum = Number(month);
        groupedMinutes[yearNum][monthNum].sort(
          (a, b) => 
            new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
        );
      });
    });

    return groupedMinutes;
  }, []);

  const toggleYear = (year: number) => {
    setOpenYears((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  const toggleMonth = (monthKey: string) => {
    setOpenMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  // Sort years in descending order (newest first)
  const sortedYears = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-[70vh]">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <CalendarDays className="h-5 w-5 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Session Minutes
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Browse official minutes of the Sangguniang Bayan ng Panglao sessions.
            Minutes document the proceedings, discussions, and decisions made during
            regular and special sessions.
          </p>
        </div>
      </div>

      {/* Minutes List */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {sortedYears.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No minutes found</h3>
            <p className="text-sm text-muted-foreground">
              Session minutes will appear here once available.
            </p>
          </div>
        ) : (
          sortedYears.map((year) => (
            <div
              key={year}
              className="mb-4 border rounded-lg overflow-hidden"
            >
              {/* Year Header */}
              <div
                className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleYear(year)}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{year}</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(grouped[year] || {}).length} months
                  </span>
                  <ChevronRight
                    className={`h-5 w-5 transition-transform ${
                      openYears.has(year) ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Months */}
              {openYears.has(year) && (
                <div className="p-4 space-y-3">
                  {Object.entries(grouped[year])
                    .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
                    .map(([month, sessions]) => {
                      const monthKey = `${year}-${month}`;
                      return (
                        <div
                          key={month}
                          className="border rounded-md overflow-hidden"
                        >
                          {/* Month Header */}
                          <div
                            className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleMonth(monthKey)}
                          >
                            <h3 className="font-medium">
                              {MONTH_NAMES[Number(month)]}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-muted-foreground">
                                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                              </span>
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  openMonths.has(monthKey) ? "rotate-90" : ""
                                }`}
                              />
                            </div>
                          </div>

                          {/* Sessions */}
                          {openMonths.has(monthKey) && (
                            <div className="divide-y">
                              {sessions.map((session) => (
                                <Card
                                  key={session.id}
                                  className="border-0 rounded-none shadow-none hover:bg-muted/30 cursor-pointer transition-colors"
                                  onClick={() => router.push(`/minutes/${session.id}`)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge 
                                            variant="secondary"
                                            className={
                                              session.sessionType === "special"
                                                ? "bg-amber-500/10 text-amber-700"
                                                : "bg-blue-500/10 text-blue-700"
                                            }
                                          >
                                            {session.sessionType === "regular"
                                              ? "Regular Session"
                                              : "Special Session"}
                                          </Badge>
                                          <Badge 
                                            variant="secondary"
                                            className={
                                              session.status === "published"
                                                ? "bg-emerald-500/10 text-emerald-700"
                                                : session.status === "approved"
                                                ? "bg-blue-500/10 text-blue-700"
                                                : "bg-gray-500/10 text-gray-600"
                                            }
                                          >
                                            {session.status.charAt(0).toUpperCase() + 
                                              session.status.slice(1)}
                                          </Badge>
                                        </div>
                                        <h4 className="text-sm font-medium">
                                          Session Minutes — {format(new Date(session.sessionDate), "MMMM d, yyyy")}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Session Date: {format(new Date(session.sessionDate), "MMMM d, yyyy")}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/minutes/${session.id}`);
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(session.pdfUrl, '_blank');
                                          }}
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
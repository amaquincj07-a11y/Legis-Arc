"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format, getYear, getMonth } from "date-fns";
import {
  Plus,
  ChevronRight,
  Eye,
  Pencil,
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
  const [currentPage, setCurrentPage] = useState(1);
  const YEARS_PER_PAGE = 10;

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

  const totalPages = Math.ceil(sortedYears.length / YEARS_PER_PAGE);
  const paginatedYears = sortedYears.slice(
    (currentPage - 1) * YEARS_PER_PAGE,
    currentPage * YEARS_PER_PAGE
  );

  return (
    <div className="min-h-[70vh]">
      {/* Hero Section */}
      <section className="relative">
        <Image
          src="/images/sb/Minutes.png"
          alt="Sangguniang Bayan of Panglao"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto object-contain"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide font-[family-name:var(--font-garamond)]"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
          >
            Session Minutes
          </h1>
          <p
            className="mt-4 max-w-2xl text-sm sm:text-lg lg:text-xl text-white font-[family-name:var(--font-garamond)]"
            style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
          >
            Browse official minutes of the Sangguniang Bayan ng Panglao sessions.
            Minutes document the proceedings, discussions, and decisions made during
            regular and special sessions.
          </p>
        </div>
      </section>

      {/* Minutes List */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {sortedYears.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="font-[family-name:var(--font-garamond)] mt-4 text-xl font-semibold">No minutes found</h3>
            <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
              Session minutes will appear here once available.
            </p>
          </div>
        ) : (
          <>
          {paginatedYears.map((year) => (
            <div
              key={year}
              className="mb-4 border rounded-lg overflow-hidden"
            >
              {/* Year Header */}
              <div
                className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors sm:p-4"
                onClick={() => toggleYear(year)}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                  <h2 className="font-[family-name:var(--font-garamond)] text-lg font-semibold sm:text-xl">{year}</h2>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="font-[family-name:var(--font-garamond)] text-sm text-muted-foreground sm:text-base">
                    {Object.keys(grouped[year] || {}).length} months
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform sm:h-5 sm:w-5 ${
                      openYears.has(year) ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Months */}
              {openYears.has(year) && (
                <div className="p-3 space-y-2 sm:p-4 sm:space-y-3">
                  {Object.entries(grouped[year])
                    .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
                    .map(([month, sessions]) => {
                      const monthKey = `${year}-${month}`;
                      const isMonthOpen = openMonths.has(monthKey);
                      return (
                        <div
                          key={month}
                          className="rounded-lg border border-border/60 overflow-hidden transition-shadow hover:shadow-sm"
                        >
                          {/* Month Header */}
                          <div
                            className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors sm:px-4 sm:py-3 ${
                              isMonthOpen
                                ? "bg-[#3998eb]/5 border-b border-[#3998eb]/10"
                                : "bg-white hover:bg-muted/40"
                            }`}
                            onClick={() => toggleMonth(monthKey)}
                          >
                            <div className="flex items-center gap-2.5">
                             
                              <div>
                                <h3 className="font-[family-name:var(--font-garamond)] text-base font-semibold text-foreground">
                                  {MONTH_NAMES[Number(month)]}
                                </h3>
                                <p className="font-[family-name:var(--font-garamond)] text-xs text-muted-foreground sm:text-sm">
                                  {sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                isMonthOpen ? "rotate-90 text-[#3998eb]" : ""
                              }`}
                            />
                          </div>

                          {/* Sessions */}
                          {isMonthOpen && (
                            <div className="divide-y divide-border/50 bg-muted/10">
                              {sessions.map((session) => (
                                <div
                                  key={session.id}
                                  className="group flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-[#3998eb]/5 sm:px-4 sm:py-3.5 sm:gap-4"
                                  onClick={() => router.push(`/minutes/${session.id}`)}
                                >
                                  {/* Date indicator */}
                                  <div className="hidden sm:flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border/60 bg-white text-center shadow-sm">
                                    <span className="font-[family-name:var(--font-garamond)] text-sm font-bold leading-none text-[#3998eb]">
                                      {format(new Date(session.sessionDate), "dd")}
                                    </span>
                                    <span className="font-[family-name:var(--font-garamond)] mt-0.5 text-[10px] uppercase leading-none text-muted-foreground">
                                      {format(new Date(session.sessionDate), "MMM")}
                                    </span>
                                  </div>

                                  {/* Session info */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                      <Badge 
                                        variant="secondary"
                                        className={`font-[family-name:var(--font-garamond)] text-xs px-1.5 py-0 sm:text-sm sm:px-2 ${
                                          session.sessionType === "special"
                                            ? "bg-amber-500/10 text-amber-700 border border-amber-200/50"
                                            : "bg-blue-500/10 text-blue-700 border border-blue-200/50"
                                        }`}
                                      >
                                        {session.sessionType === "regular"
                                          ? "Regular"
                                          : "Special"}
                                      </Badge>
                                    
                                    </div>
                                    <h4 className="font-[family-name:var(--font-garamond)] text-sm font-medium text-foreground group-hover:text-[#3998eb] transition-colors sm:text-base">
                                      Session Minutes — {format(new Date(session.sessionDate), "MMMM d, yyyy")}
                                    </h4>
                                    <p className="font-[family-name:var(--font-garamond)] mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                      {format(new Date(session.sessionDate), "EEEE")}
                                    </p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[#3998eb]/10 hover:text-[#3998eb] sm:h-9 sm:w-9"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/minutes/${session.id}`);
                                      }}
                                      title="View Document"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 hidden sm:block" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
                Showing years {paginatedYears[0]}–{paginatedYears[paginatedYears.length - 1]} ({sortedYears.length} total years)
              </p>
              <div className="flex items-center gap-1 flex-wrap justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90" : ""}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
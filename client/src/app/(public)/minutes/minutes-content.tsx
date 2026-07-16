"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format, getYear, getMonth } from "date-fns";
import {
  ChevronRight,
  Eye,
  CalendarDays,
  Calendar,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchPublicSessionMinutesAction } from "@/lib/public-minutes-actions";
import { usePlaceFilter } from "@/lib/place-filter-context";
import type { SessionMinutes } from "@/lib/types";

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

function toSessionDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function MinutesContent() {
  const router = useRouter();
  const { province, municipality, municipalityName, provinceName } = usePlaceFilter();
  const [openYears, setOpenYears] = useState<Set<number>>(new Set());
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [minutes, setMinutes] = useState<SessionMinutes[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const YEARS_PER_PAGE = 10;

  const loadMinutes = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const result = await fetchPublicSessionMinutesAction(province, municipality);

    if (result.success) {
      setMinutes(result.data);
    } else {
      setMinutes([]);
      setLoadError(result.error);
    }

    setLoading(false);
  }, [province, municipality]);

  useEffect(() => {
    void loadMinutes();
  }, [loadMinutes]);

  useEffect(() => {
    setCurrentPage(1);
    setOpenYears(new Set());
    setOpenMonths(new Set());
  }, [province, municipality]);

  const grouped = useMemo(() => {
    const groupedMinutes: GroupedMinutes = {};
    minutes.forEach((minute) => {
      const sessionDate = toSessionDate(minute.sessionDate);
      const year = getYear(sessionDate);
      const month = getMonth(sessionDate);

      if (!groupedMinutes[year]) {
        groupedMinutes[year] = {};
      }

      if (!groupedMinutes[year][month]) {
        groupedMinutes[year][month] = [];
      }

      groupedMinutes[year][month].push(minute);
    });

    Object.keys(groupedMinutes).forEach((year) => {
      const yearNum = Number(year);
      Object.keys(groupedMinutes[yearNum]).forEach((month) => {
        const monthNum = Number(month);
        groupedMinutes[yearNum][monthNum].sort(
          (a, b) =>
            toSessionDate(b.sessionDate).getTime() -
            toSessionDate(a.sessionDate).getTime()
        );
      });
    });

    return groupedMinutes;
  }, [minutes]);

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
      <section className="relative">
        <Image
          src="/images/sb/Hero-Background.png"
          alt={`Sangguniang Bayan of ${municipalityName}`}
          width={1920}
          height={1080}
          priority
          className="h-auto w-full object-contain"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1
            className="font-[family-name:var(--font-garamond)] text-3xl font-bold uppercase tracking-wide text-white sm:text-5xl lg:text-6xl"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
          >
            Session Minutes
          </h1>
          <p
            className="font-[family-name:var(--font-garamond)] mt-4 max-w-2xl text-sm text-white sm:text-lg lg:text-xl"
            style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
          >
            Browse official minutes of the Sangguniang Bayan ng {municipalityName},{" "}
            {provinceName} sessions. Minutes document the proceedings, discussions,
            and decisions made during regular and special sessions.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
              Loading session minutes for {municipalityName}, {provinceName}...
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-[family-name:var(--font-garamond)] text-xl font-semibold">
              Unable to load session minutes
            </h3>
            <p className="font-[family-name:var(--font-garamond)] mt-1 text-base text-muted-foreground">
              {loadError}
            </p>
            <Button className="mt-4" variant="outline" onClick={() => void loadMinutes()}>
              Try again
            </Button>
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-[family-name:var(--font-garamond)] mt-4 text-xl font-semibold">
              No minutes found
            </h3>
            <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
              No published session minutes are available for {municipalityName},{" "}
              {provinceName} yet.
            </p>
          </div>
        ) : (
          <>
            {paginatedYears.map((year) => (
              <div key={year} className="mb-4 overflow-hidden rounded-lg border">
                <div
                  className="flex cursor-pointer items-center justify-between bg-muted/30 p-3 transition-colors hover:bg-muted/50 sm:p-4"
                  onClick={() => toggleYear(year)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                    <h2 className="font-[family-name:var(--font-garamond)] text-lg font-semibold sm:text-xl">
                      {year}
                    </h2>
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

                {openYears.has(year) && (
                  <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
                    {Object.entries(grouped[year])
                      .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
                      .map(([month, sessions]) => {
                        const monthKey = `${year}-${month}`;
                        const isMonthOpen = openMonths.has(monthKey);
                        return (
                          <div
                            key={month}
                            className="overflow-hidden rounded-lg border border-border/60 transition-shadow hover:shadow-sm"
                          >
                            <div
                              className={`flex cursor-pointer items-center justify-between px-3 py-2.5 transition-colors sm:px-4 sm:py-3 ${
                                isMonthOpen
                                  ? "border-b border-[#3998eb]/10 bg-[#3998eb]/5"
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
                                    {sessions.length} session
                                    {sessions.length !== 1 ? "s" : ""} recorded
                                  </p>
                                </div>
                              </div>
                              <ChevronRight
                                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                  isMonthOpen ? "rotate-90 text-[#3998eb]" : ""
                                }`}
                              />
                            </div>

                            {isMonthOpen && (
                              <div className="divide-y divide-border/50 bg-muted/10">
                                {sessions.map((session) => {
                                  const sessionDate = toSessionDate(session.sessionDate);
                                  return (
                                    <div
                                      key={session.id}
                                      className="group flex cursor-pointer items-center gap-3 px-3 py-3 transition-colors hover:bg-[#3998eb]/5 sm:gap-4 sm:px-4 sm:py-3.5"
                                      onClick={() => router.push(`/minutes/${session.id}`)}
                                    >
                                      <div className="hidden h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border/60 bg-white text-center shadow-sm sm:flex">
                                        <span className="font-[family-name:var(--font-garamond)] text-sm font-bold leading-none text-[#3998eb]">
                                          {format(sessionDate, "dd")}
                                        </span>
                                        <span className="font-[family-name:var(--font-garamond)] mt-0.5 text-[10px] uppercase leading-none text-muted-foreground">
                                          {format(sessionDate, "MMM")}
                                        </span>
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                          <Badge
                                            variant="secondary"
                                            className={`font-[family-name:var(--font-garamond)] px-1.5 py-0 text-xs sm:px-2 sm:text-sm ${
                                              session.sessionType === "special"
                                                ? "border border-amber-200/50 bg-amber-500/10 text-amber-700"
                                                : "border border-blue-200/50 bg-blue-500/10 text-blue-700"
                                            }`}
                                          >
                                            {session.sessionType === "regular"
                                              ? "Regular"
                                              : "Special"}
                                          </Badge>
                                        </div>
                                        <h4 className="font-[family-name:var(--font-garamond)] text-sm font-medium text-foreground transition-colors group-hover:text-[#3998eb] sm:text-base">
                                          Session Minutes —{" "}
                                          {format(sessionDate, "MMMM d, yyyy")}
                                        </h4>
                                        <p className="font-[family-name:var(--font-garamond)] mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                          {format(sessionDate, "EEEE")}
                                        </p>
                                      </div>

                                      <div className="flex shrink-0 items-center gap-1">
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
                                        <ChevronRight className="hidden h-4 w-4 text-muted-foreground/40 sm:block" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
                  Showing years {paginatedYears[0]}–
                  {paginatedYears[paginatedYears.length - 1]} ({sortedYears.length}{" "}
                  total years)
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1">
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
                      className={
                        page === currentPage
                          ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                          : ""
                      }
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

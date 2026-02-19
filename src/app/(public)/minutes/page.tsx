"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { mockMinutes } from "@/lib/mock-data";

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

interface YearGroup {
  year: number;
  months: MonthGroup[];
}

interface MonthGroup {
  month: number;
  monthName: string;
  sessions: typeof mockMinutes;
}

export default function MinutesPage() {
  const publicMinutes = mockMinutes.filter((m) => m.isPublic);

  const tree = useMemo(() => {
    const yearMap = new Map<number, Map<number, typeof mockMinutes>>();

    for (const m of publicMinutes) {
      const y = m.sessionDate.getFullYear();
      const mo = m.sessionDate.getMonth();
      if (!yearMap.has(y)) yearMap.set(y, new Map());
      const monthMap = yearMap.get(y)!;
      if (!monthMap.has(mo)) monthMap.set(mo, []);
      monthMap.get(mo)!.push(m);
    }

    const result: YearGroup[] = [];
    const sortedYears = [...yearMap.keys()].sort((a, b) => b - a);

    for (const year of sortedYears) {
      const monthMap = yearMap.get(year)!;
      const months: MonthGroup[] = [];
      const sortedMonths = [...monthMap.keys()].sort((a, b) => b - a);

      for (const month of sortedMonths) {
        const sessions = monthMap.get(month)!;
        sessions.sort(
          (a, b) => b.sessionDate.getTime() - a.sessionDate.getTime()
        );
        months.push({
          month,
          monthName: MONTH_NAMES[month],
          sessions,
        });
      }
      result.push({ year, months });
    }
    return result;
  }, [publicMinutes]);

  const defaultOpenYears = tree.length > 0 ? [String(tree[0].year)] : [];

  return (
    <div className="min-h-[70vh]">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <BookOpen className="h-5 w-5 text-gold" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Session Minutes
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Official records of Sangguniang Bayan sessions. Browse by year and
            month to find session minutes, including deliberations, motions, and
            official proceedings.
          </p>
        </div>
      </div>

      {/* Tree Navigation */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {publicMinutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No session minutes available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Published session minutes will appear here.
            </p>
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={defaultOpenYears}
            className="space-y-3"
          >
            {tree.map((yearGroup) => (
              <AccordionItem
                key={yearGroup.year}
                value={String(yearGroup.year)}
                className="overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/10 text-navy">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-base font-bold text-foreground">
                        {yearGroup.year}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {yearGroup.months.reduce(
                          (sum, m) => sum + m.sessions.length,
                          0
                        )}{" "}
                        session
                        {yearGroup.months.reduce(
                          (sum, m) => sum + m.sessions.length,
                          0
                        ) !== 1
                          ? "s"
                          : ""}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4">
                  <Accordion type="multiple" defaultValue={yearGroup.months.map((m) => `${yearGroup.year}-${m.month}`)}>
                    {yearGroup.months.map((monthGroup) => (
                      <AccordionItem
                        key={`${yearGroup.year}-${monthGroup.month}`}
                        value={`${yearGroup.year}-${monthGroup.month}`}
                        className="border-0 border-b last:border-b-0"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <span className="text-sm font-semibold text-foreground/80">
                            {monthGroup.monthName}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {monthGroup.sessions.map((session) => (
                              <Link
                                key={session.id}
                                href={`/minutes/${session.id}`}
                                className="group block"
                              >
                                <Card className="border transition-all duration-200 hover:border-teal/30 hover:shadow-sm">
                                  <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-foreground group-hover:text-teal">
                                          {format(session.sessionDate, "MMMM d, yyyy")}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-2">
                                          <Badge
                                            variant="secondary"
                                            className={
                                              session.sessionType === "special"
                                                ? "bg-gold/15 text-gold text-[10px] px-1.5 py-0"
                                                : "bg-navy/10 text-navy text-[10px] px-1.5 py-0"
                                            }
                                          >
                                            {session.sessionType === "regular"
                                              ? "Regular"
                                              : "Special"}
                                          </Badge>
                                          {session.sessionNumber && (
                                            <span className="text-xs text-muted-foreground">
                                              Session #{session.sessionNumber}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-teal" />
                                  </CardContent>
                                </Card>
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}

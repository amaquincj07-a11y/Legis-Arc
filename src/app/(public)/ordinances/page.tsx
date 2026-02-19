"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ScrollText, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { mockOrdinances, mockCategories } from "@/lib/mock-data";

const PUBLIC_ORDINANCES = mockOrdinances.filter((d) => d.isPublic);

const YEARS = [...new Set(PUBLIC_ORDINANCES.map((d) => d.seriesYear))].sort(
  (a, b) => b - a
);
const AUTHORS = [
  ...new Set(PUBLIC_ORDINANCES.map((d) => d.authorSponsor)),
].sort();

export default function OrdinancesPage() {
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");

  const filtered = useMemo(() => {
    let docs = PUBLIC_ORDINANCES;
    if (yearFilter !== "all") {
      docs = docs.filter((d) => d.seriesYear === Number(yearFilter));
    }
    if (categoryFilter !== "all") {
      docs = docs.filter((d) => d.category === categoryFilter);
    }
    if (authorFilter !== "all") {
      docs = docs.filter((d) => d.authorSponsor === authorFilter);
    }
    return docs.sort(
      (a, b) => b.dateApproved.getTime() - a.dateApproved.getTime()
    );
  }, [yearFilter, categoryFilter, authorFilter]);

  return (
    <div className="min-h-[70vh]">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
              <ScrollText className="h-5 w-5 text-navy" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ordinances
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Browse published ordinances enacted by the Sangguniang Bayan ng
            Panglao. These local laws govern municipal affairs, regulations, and
            policies for the community.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-xs font-medium text-muted-foreground">
            Filter by:
          </span>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {mockCategories
                .filter((c) => c.isActive)
                .map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={authorFilter} onValueChange={setAuthorFilter}>
            <SelectTrigger className="h-8 w-[200px] text-xs">
              <SelectValue placeholder="Author / Sponsor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {AUTHORS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <span className="text-xs text-muted-foreground">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Card Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ScrollText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No ordinances found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting the filters above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc) => (
              <OrdinanceCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrdinanceCard({
  doc,
}: {
  doc: (typeof PUBLIC_ORDINANCES)[number];
}) {
  const docNumber = doc.approvedNumber || doc.proposedNumber;

  return (
    <Link href={`/ordinances/${doc.id}`} className="group">
      <Card className="h-full border-2 border-transparent transition-all duration-200 hover:border-teal/20 hover:shadow-md">
        <CardContent className="flex h-full flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="secondary" className="bg-navy/10 text-navy text-xs">
              {doc.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {doc.seriesYear}
            </span>
          </div>

          <p className="text-xs font-semibold text-teal">
            Ordinance No. {docNumber}
          </p>

          <h3 className="mt-1.5 line-clamp-2 flex-1 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-navy">
            {doc.title}
          </h3>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(doc.dateApproved, "MMM d, yyyy")}
            </span>
            <span className="inline-flex items-center gap-1 text-teal opacity-0 transition-opacity group-hover:opacity-100">
              View
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

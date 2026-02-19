"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  FileText,
  ScrollText,
  Calendar,
  X,
  SearchX,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockOrdinances, mockResolutions, mockCategories } from "@/lib/mock-data";
import type { LegislativeDocument } from "@/lib/types";

const ALL_PUBLIC_DOCS = [...mockOrdinances, ...mockResolutions].filter(
  (d) => d.isPublic
);

const YEARS = [...new Set(ALL_PUBLIC_DOCS.map((d) => d.seriesYear))].sort(
  (a, b) => b - a
);

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") ?? "";
  const initialType = searchParams.get("type") ?? "all";
  const initialYear = searchParams.get("year") ?? "all";
  const initialCategory = searchParams.get("category") ?? "all";

  const [query, setQuery] = useState(initialQ);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [yearFilter, setYearFilter] = useState(initialYear);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateUrl = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value && value !== "all") {
          sp.set(key, value);
        } else {
          sp.delete(key);
        }
      }
      router.replace(`/search?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateUrl({ q: query.trim(), type: typeFilter, year: yearFilter, category: categoryFilter });
  }

  function handleTypeChange(value: string) {
    setTypeFilter(value);
    updateUrl({ q: query.trim(), type: value, year: yearFilter, category: categoryFilter });
  }

  function handleYearChange(value: string) {
    setYearFilter(value);
    updateUrl({ q: query.trim(), type: typeFilter, year: value, category: categoryFilter });
  }

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    updateUrl({ q: query.trim(), type: typeFilter, year: yearFilter, category: value });
  }

  function clearFilters() {
    setQuery("");
    setTypeFilter("all");
    setYearFilter("all");
    setCategoryFilter("all");
    router.replace("/search", { scroll: false });
  }

  const results = useMemo(() => {
    let filtered = ALL_PUBLIC_DOCS;

    const q = (searchParams.get("q") ?? "").toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.approvedNumber.toLowerCase().includes(q) ||
          d.proposedNumber.toLowerCase().includes(q) ||
          d.authorSponsor.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }

    const type = searchParams.get("type");
    if (type && type !== "all") {
      filtered = filtered.filter((d) => d.documentType === type);
    }

    const year = searchParams.get("year");
    if (year && year !== "all") {
      filtered = filtered.filter((d) => d.seriesYear === Number(year));
    }

    const cat = searchParams.get("category");
    if (cat && cat !== "all") {
      filtered = filtered.filter((d) => d.category === cat);
    }

    return filtered.sort(
      (a, b) => b.dateApproved.getTime() - a.dateApproved.getTime()
    );
  }, [searchParams]);

  const hasActiveFilters =
    searchParams.get("q") ||
    (searchParams.get("type") && searchParams.get("type") !== "all") ||
    (searchParams.get("year") && searchParams.get("year") !== "all") ||
    (searchParams.get("category") && searchParams.get("category") !== "all");

  return (
    <div className="min-h-[70vh]">
      {/* Sticky Search Header */}
      <div className="sticky top-16 z-40 border-b bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents..."
                className="h-10 pl-10 pr-4"
              />
            </div>
            <Button type="submit" className="bg-teal text-white hover:bg-teal/90">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </form>

          {/* Desktop Filters */}
          <div className="mt-3 hidden items-center gap-3 lg:flex">
            <span className="text-xs font-medium text-muted-foreground">Filters:</span>
            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ordinance">Ordinance</SelectItem>
                <SelectItem value="resolution">Resolution</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={handleYearChange}>
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
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
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
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="mt-3 flex flex-col gap-2 lg:hidden">
              <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ordinance">Ordinance</SelectItem>
                  <SelectItem value="resolution">Resolution</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={handleYearChange}>
                <SelectTrigger className="h-9 text-xs">
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
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-9 text-xs">
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
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start gap-1 text-xs text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X className="h-3 w-3" />
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {results.length === 0
              ? "No results found"
              : `${results.length} document${results.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <SearchX className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No documents found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try adjusting your search terms or filters to find what you&apos;re
              looking for.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[180px]">Document No.</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead className="w-[80px]">Year</TableHead>
                      <TableHead className="w-[140px]">Category</TableHead>
                      <TableHead className="w-[130px]">Date Approved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((doc) => (
                      <ResultTableRow key={doc.id} doc={doc} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {results.map((doc) => (
                <ResultCard key={doc.id} doc={doc} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResultTableRow({ doc }: { doc: LegislativeDocument }) {
  const href =
    doc.documentType === "ordinance"
      ? `/ordinances/${doc.id}`
      : `/resolutions/${doc.id}`;
  const typeLabel =
    doc.documentType === "ordinance" ? "Ordinance" : "Resolution";
  const docNumber = doc.approvedNumber || doc.proposedNumber;

  return (
    <TableRow className="group cursor-pointer" onClick={() => {}}>
      <TableCell>
        <Link
          href={href}
          className="font-medium text-teal hover:underline"
        >
          {typeLabel} No. {docNumber}
        </Link>
      </TableCell>
      <TableCell>
        <Link href={href} className="block hover:text-navy">
          <span className="line-clamp-2 text-sm">{doc.title}</span>
        </Link>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={
            doc.documentType === "ordinance"
              ? "bg-navy/10 text-navy"
              : "bg-teal/10 text-teal"
          }
        >
          {typeLabel}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{doc.seriesYear}</TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{doc.category}</span>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {format(doc.dateApproved, "MMM d, yyyy")}
      </TableCell>
    </TableRow>
  );
}

function ResultCard({ doc }: { doc: LegislativeDocument }) {
  const href =
    doc.documentType === "ordinance"
      ? `/ordinances/${doc.id}`
      : `/resolutions/${doc.id}`;
  const typeLabel =
    doc.documentType === "ordinance" ? "Ordinance" : "Resolution";
  const docNumber = doc.approvedNumber || doc.proposedNumber;
  const Icon = doc.documentType === "ordinance" ? ScrollText : FileText;

  return (
    <Link href={href}>
      <Card className="transition-all duration-200 hover:shadow-md active:scale-[0.99]">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={
                doc.documentType === "ordinance"
                  ? "bg-navy/10 text-navy"
                  : "bg-teal/10 text-teal"
              }
            >
              <Icon className="mr-1 h-3 w-3" />
              {typeLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {doc.seriesYear}
            </span>
          </div>
          <p className="text-xs font-semibold text-teal">
            {typeLabel} No. {docNumber}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {doc.title}
          </h3>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(doc.dateApproved, "MMM d, yyyy")}
            </span>
            {doc.category && (
              <>
                <span className="text-border">|</span>
                <span>{doc.category}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

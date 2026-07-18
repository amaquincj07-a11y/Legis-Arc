"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  SearchX,
  Eye,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockOrdinances, mockResolutions, mockCategories } from "@/lib/mock-data";
import { useLguHref } from "@/hooks/use-lgu-href";
import { formatOrdinanceNumber, formatResolutionNumber } from "@/lib/utils";
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
  const { href } = useLguHref();

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
    // Redirect to specific document type page when a specific type is selected
    if (value === "ordinance") {
      const searchQuery = query.trim();
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (yearFilter && yearFilter !== "all") params.set("year", yearFilter);
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      router.push(
        `${href("/ordinances")}${params.toString() ? `?${params.toString()}` : ""}`
      );
      return;
    }
    if (value === "resolution") {
      const searchQuery = query.trim();
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (yearFilter && yearFilter !== "all") params.set("year", yearFilter);
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      router.push(
        `${href("/resolutions")}${params.toString() ? `?${params.toString()}` : ""}`
      );
      return;
    }
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
            <Button type="submit" className="bg-[#3998eb] text-white hover:bg-[#3998eb]/90">
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
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead style={{ backgroundColor: "#101B29", color: "white" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Document No.</th>
                    <th className="px-4 py-3 text-left font-semibold">Title</th>
                    <th className="px-4 py-3 text-center font-semibold">Category</th>
                    <th className="px-4 py-3 text-center font-semibold">Author/Sponsor</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((doc) => (
                    <ResultTableRow key={doc.id} doc={doc} />
                  ))}
                </tbody>
              </table>
            </div>


          </>
        )}
      </div>
    </div>
  );
}

function ResultTableRow({ doc }: { doc: LegislativeDocument }) {
  const { href: lguHref } = useLguHref();
  const docHref =
    doc.documentType === "ordinance"
      ? lguHref(`/ordinances/${doc.id}`)
      : lguHref(`/resolutions/${doc.id}`);
  const typeLabel =
    doc.documentType === "ordinance" ? "Ordinance" : "Resolution";
  const formattedNumber =
    doc.documentType === "ordinance"
      ? formatOrdinanceNumber(doc)
      : formatResolutionNumber(doc);

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="border border-gray-300 px-4 py-2 text-center">
        <Link href={docHref} className="font-medium text-[#3998eb] hover:underline">
          {formattedNumber}
        </Link>
        <Badge
          variant="secondary"
          className={`ml-2 text-[10px] ${
            doc.documentType === "ordinance"
              ? "bg-[#3998eb]/10 text-[#3998eb]"
              : "bg-[#cbab53]/10 text-[#cbab53]"
          }`}
        >
          {typeLabel}
        </Badge>
      </td>
      <td className="border border-gray-300 px-4 py-2">
        <Link href={docHref} className="hover:text-[#3998eb]">
          {doc.title}
        </Link>
      </td>
      <td className="border border-gray-300 px-4 py-2 text-center">
        {doc.category}
      </td>
      <td className="border border-gray-300 px-4 py-2 text-center">
        {doc.authorSponsor}
      </td>
      <td className="border border-gray-300 px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="group relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#3998eb]/80 hover:bg-[#3998eb]/5 hover:text-[#3998eb]"
            onClick={() => {
              const link = document.createElement("a");
              link.href = doc.pdfUrl;
              link.download = `${doc.title}.pdf`;
              link.click();
            }}
            title="Download PDF"
          >
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition group-hover:opacity-100">
              Download PDF
            </span>
            <Download className="size-4" />
          </button>
          <button
            type="button"
            className="group relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#cbab53]/80 hover:bg-[#cbab53]/5 hover:text-[#cbab53]"
            onClick={() => {
              window.open(doc.pdfUrl, "_blank");
            }}
            title="View PDF"
          >
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition group-hover:opacity-100">
              View PDF
            </span>
            <Eye className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

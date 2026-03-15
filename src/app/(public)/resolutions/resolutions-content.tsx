"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, Eye, Download, Search, Calendar, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { mockResolutions, mockCategories } from "@/lib/mock-data";

const PUBLIC_RESOLUTIONS = mockResolutions.filter((d) => d.isPublic);

const YEARS = [...new Set(PUBLIC_RESOLUTIONS.map((d) => d.seriesYear))].sort(
  (a, b) => b - a
);
const AUTHORS = [
  ...new Set(PUBLIC_RESOLUTIONS.map((d) => d.authorSponsor)),
].sort();

export function ResolutionsContent() {
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const initialQ = searchParams.get("q") ?? "";
  const initialYear = searchParams.get("year") ?? "all";
  const initialCategory = searchParams.get("category") ?? "all";
  
  const [search, setSearch] = useState(initialQ);
  const [yearFilter, setYearFilter] = useState(initialYear);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Update state when URL params change
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const year = searchParams.get("year") ?? "all";
    const category = searchParams.get("category") ?? "all";
    setSearch(q);
    setYearFilter(year);
    setCategoryFilter(category);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let docs = PUBLIC_RESOLUTIONS;
    if (search) {
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.approvedNumber?.toLowerCase().includes(search.toLowerCase()) ||
          d.proposedNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (yearFilter !== "all") {
      docs = docs.filter((d) => d.seriesYear === Number(yearFilter));
    }
    if (categoryFilter !== "all") {
      docs = docs.filter((d) => d.category === categoryFilter);
    }
    return docs.sort(
      (a, b) => b.dateApproved.getTime() - a.dateApproved.getTime()
    );
  }, [search, yearFilter, categoryFilter]);

  const tableHeaderStyle = {
    backgroundColor: "#101B29",
    color: "white",
  };

  return (
    <div className="min-h-[70vh]">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
              <FileText className="h-5 w-5 text-teal" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Resolutions
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Browse published resolutions of the Sangguniang Bayan ng Panglao.
            Resolutions express the formal will of the legislative body on
            matters of public interest and governance.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          {/* Search + filter toggle row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resolutions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden h-9 w-9"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <span className="hidden text-xs text-muted-foreground sm:inline whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Desktop Filters */}
          <div className="mt-2 hidden items-center gap-3 lg:flex">
            <span className="text-xs font-medium text-muted-foreground">Filter by:</span>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.filter((c) => c.isActive).map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-xs text-muted-foreground">
              {filtered.length} document{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="mt-3 flex flex-col gap-2 lg:hidden">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockCategories.filter((c) => c.isActive).map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
                {(yearFilter !== "all" || categoryFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={() => { setYearFilter("all"); setCategoryFilter("all"); }}
                  >
                    <X className="h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No resolutions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting the filters above.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead style={tableHeaderStyle}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Resolution No.</th>
                    <th className="px-4 py-3 text-left font-semibold">Title</th>
                    <th className="px-4 py-3 text-center font-semibold">Category</th>
                    <th className="px-4 py-3 text-center font-semibold">Author/Sponsor</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => {
                    const fullNumber = doc.approvedNumber || doc.proposedNumber;
                    const [year, num] = fullNumber.split("-");
                    const formattedNumber = `${num}-${year}`;
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {formattedNumber}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {doc.title}
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
                              className="group relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-shadow-sm transition hover:border-[#3998eb]/80 hover:bg-[#3998eb]/5 hover:text-[#3998eb]"
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
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {filtered.map((doc) => {
                const fullNumber = doc.approvedNumber || doc.proposedNumber;
                const [year, num] = fullNumber.split("-");
                const formattedNumber = `${num}-${year}`;
                return (
                  <Card key={doc.id} className="transition-all duration-200 border-[#3998eb] hover:shadow-md active:scale-[0.99]">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-[#cbab53]/10 text-[#cbab53]">
                          <FileText className="mr-1 h-3 w-3" />
                          Resolution
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {doc.seriesYear}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#3998eb]">
                        Resolution No. {formattedNumber}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {doc.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                      <div className="mt-3 flex items-center gap-2 border-t pt-3">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 rounded-md border border-[#3998eb] bg-white px-3 py-1.5 text-xs font-medium text-[#3998eb] shadow-sm transition hover:border-[#cbab53]/80 hover:text-[#cbab53]"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = doc.pdfUrl;
                            link.download = `${doc.title}.pdf`;
                            link.click();
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 rounded-md border border-[#3998eb] bg-white px-3 py-1.5 text-xs font-medium text-[#3998eb] shadow-sm transition hover:border-[#cbab53]/80 hover:text-[#cbab53]"
                          onClick={() => { window.open(doc.pdfUrl, "_blank"); }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View PDF
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

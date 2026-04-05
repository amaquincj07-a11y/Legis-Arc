"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ScrollText, Eye, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { mockOrdinances, mockCategories } from "@/lib/mock-data";
import { formatOrdinanceNumber } from "@/lib/utils";

const PUBLIC_ORDINANCES = mockOrdinances.filter((d) => d.isPublic);

const YEARS = [...new Set(PUBLIC_ORDINANCES.map((d) => d.seriesYear))].sort(
  (a, b) => b - a
);
const AUTHORS = [
  ...new Set(PUBLIC_ORDINANCES.map((d) => d.authorSponsor)),
].sort();

export function OrdinancesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initialize state from URL params
  const initialQ = searchParams.get("q") ?? "";
  const initialYear = searchParams.get("year") ?? "all";
  const initialCategory = searchParams.get("category") ?? "all";
  
  const [search, setSearch] = useState(initialQ);
  const [yearFilter, setYearFilter] = useState(initialYear);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [authorFilter, setAuthorFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
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
    let docs = PUBLIC_ORDINANCES;
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
    if (authorFilter !== "all") {
      docs = docs.filter((d) => d.authorSponsor === authorFilter);
    }
    return docs.sort(
      (a, b) => b.dateApproved.getTime() - a.dateApproved.getTime()
    );
  }, [search, yearFilter, categoryFilter, authorFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, yearFilter, categoryFilter, authorFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tableHeaderStyle = {
    backgroundColor: "#101B29",
    color: "white",
  };

  return (
    <div className="min-h-[70vh]">
      {/* Page Header with Background Image */}
      <div className="relative overflow-hidden">
        <div className="relative w-full">
          <Image
            src="/images/sb/Ordinance-Background.png"
            alt="Sangguniang Bayan of Panglao"
            width={1920}
            height={1080}
            className="w-full h-auto object-contain"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h1
                className="font-[family-name:var(--font-garamond)] text-3xl font-bold uppercase tracking-[0.15em] text-white sm:text-5xl lg:text-7xl"
                style={{ textShadow: "0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)" }}
              >
                Ordinances
              </h1>
              <p
                className="font-[family-name:var(--font-garamond)] mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-base lg:text-lg"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
              >
                Browse published ordinances enacted by the Sangguniang Bayan ng
                Panglao. These local laws govern municipal affairs, regulations, and
                policies for the community.
              </p>
            </div>
          </div>
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
                placeholder="Search ordinances..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="font-[family-name:var(--font-garamond)] h-9 pl-9 text-sm"
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
            <span className="font-[family-name:var(--font-garamond)] hidden text-sm text-muted-foreground sm:inline whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Desktop Filters */}
          <div className="mt-2 hidden items-center gap-3 lg:flex">
            <span className="font-[family-name:var(--font-garamond)] text-sm font-medium text-muted-foreground">Filter by:</span>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="font-[family-name:var(--font-garamond)] h-8 w-[120px] text-sm">
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
              <SelectTrigger className="font-[family-name:var(--font-garamond)] h-8 w-[160px] text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.filter((c) => c.isActive).map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={authorFilter} onValueChange={setAuthorFilter}>
              <SelectTrigger className="font-[family-name:var(--font-garamond)] h-8 w-[200px] text-sm">
                <SelectValue placeholder="Author / Sponsor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {AUTHORS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-5" />
            <span className="font-[family-name:var(--font-garamond)] text-sm text-muted-foreground">
              {filtered.length} document{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="mt-3 flex flex-col gap-2 lg:hidden">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="font-[family-name:var(--font-garamond)] h-9 text-sm">
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
                <SelectTrigger className="font-[family-name:var(--font-garamond)] h-9 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockCategories.filter((c) => c.isActive).map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger className="font-[family-name:var(--font-garamond)] h-9 text-sm">
                  <SelectValue placeholder="Author / Sponsor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {AUTHORS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-garamond)] text-sm text-muted-foreground">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
                {(yearFilter !== "all" || categoryFilter !== "all" || authorFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={() => { setYearFilter("all"); setCategoryFilter("all"); setAuthorFilter("all"); }}
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
              <ScrollText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-[family-name:var(--font-garamond)] text-xl font-semibold">No ordinances found</h3>
            <p className="font-[family-name:var(--font-garamond)] mt-1 text-base text-muted-foreground">
              Try adjusting the filters above.
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead style={tableHeaderStyle}>
                  <tr>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-left text-sm font-semibold sm:text-base">Ordinance No.</th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-left text-sm font-semibold sm:text-base">Title</th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-center text-sm font-semibold sm:text-base">Category</th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-center text-sm font-semibold sm:text-base">Author/Sponsor</th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-center text-sm font-semibold sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((doc) => {
                    const formattedNumber = formatOrdinanceNumber(doc);
                    return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                        {formattedNumber}
                      </td>
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-sm sm:text-base">
                        {doc.title}
                      </td>
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                        {doc.category}
                      </td>
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                        {doc.authorSponsor}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="group relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#cbab53]/80 hover:bg-[#cbab53]/5 hover:text-[#cbab53]"
                            onClick={() => {
                              router.push(`/ordinances/${doc.id}`);
                            }}
                            title="View Document"
                          >
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition group-hover:opacity-100">
                              View Document
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} ordinances
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-[family-name:var(--font-garamond)] h-8 px-3 text-sm"
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
                      className={`font-[family-name:var(--font-garamond)] h-8 w-8 p-0 text-sm ${page === currentPage ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-[family-name:var(--font-garamond)] h-8 px-3 text-sm"
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

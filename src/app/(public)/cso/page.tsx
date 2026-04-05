"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Users, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCSOOrganizations } from "@/lib/mock-data";

const TERMS = ["2022-2025", "2019-2022", "2016-2019", "2013-2016", "2010-2013"];
const ITEMS_PER_PAGE = 10;

export default function CSOPage() {
  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let orgs = [...mockCSOOrganizations];
    if (search) {
      const q = search.toLowerCase();
      orgs = orgs.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.officerName.toLowerCase().includes(q)
      );
    }
    if (termFilter !== "all") {
      orgs = orgs.filter((o) => o.term === termFilter);
    }
    return orgs.sort((a, b) => a.name.localeCompare(b.name));
  }, [search, termFilter]);

  // Reset to page 1 when filters change
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginatedOrgs = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

  const handleFilterChange = (value: string, setter: (v: string) => void) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("ellipsis");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const tableHeaderStyle = {
    backgroundColor: "#101B29",
    color: "white",
  };

  return (
    <div className="min-h-[70vh]">
      {/* Hero Section */}
      <section className="relative">
        <Image
          src="/images/sb/CSO-Background.png"
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
            Accredited Civil Society Organizations
          </h1>
          <p
            className="mt-4 max-w-2xl text-sm sm:text-lg lg:text-xl text-white font-[family-name:var(--font-garamond)]"
            style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
          >
            List of accredited Civil Society Organizations (CSOs) recognized by
            the Sangguniang Bayan ng Panglao through official resolutions.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search organizations or officers..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
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
              {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Desktop Filters */}
          <div className="mt-2 hidden items-center gap-3 lg:flex">
            <span className="text-xs font-medium text-muted-foreground">Filter by:</span>
            <Select value={termFilter} onValueChange={(v) => handleFilterChange(v, setTermFilter)}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {TERMS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="mt-3 flex flex-col gap-2 lg:hidden">
              <Select value={termFilter} onValueChange={(v) => handleFilterChange(v, setTermFilter)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {TERMS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
                {termFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={() => handleFilterChange("all", setTermFilter)}
                  >
                    <X className="h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No organizations found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting the search or filters above.
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead style={tableHeaderStyle}>
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold w-12">#</th>
                    <th className="px-4 py-3 text-left font-semibold">Name of Organization</th>
                    <th className="px-4 py-3 text-left font-semibold">Name of Officer(s)</th>
                    <th className="px-4 py-3 text-center font-semibold">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrgs.map((org, index) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {startIndex + index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                        {org.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {org.officerName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {org.position}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} organizations
                </p>
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPageNumbers().map((page, i) =>
                    page === "ellipsis" ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={page === safePage ? "default" : "outline"}
                        size="icon"
                        className={`h-8 w-8 text-xs font-medium ${
                          page === safePage
                            ? "bg-[#101B29] text-white hover:bg-[#101B29]/90"
                            : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                        aria-label={`Page ${page}`}
                        aria-current={page === safePage ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

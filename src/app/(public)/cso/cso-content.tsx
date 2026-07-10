"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Users,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPublicCSOOrganizationsAction } from "@/lib/public-cso-actions";
import { usePlaceFilter } from "@/lib/place-filter-context";
import type { CSOOrganization } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export function CSOContent() {
  const { province, municipality, municipalityName, provinceName } = usePlaceFilter();
  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [organizations, setOrganizations] = useState<CSOOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const result = await fetchPublicCSOOrganizationsAction(province, municipality);

    if (result.success) {
      setOrganizations(result.data);
    } else {
      setOrganizations([]);
      setLoadError(result.error);
    }

    setLoading(false);
  }, [province, municipality]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    setCurrentPage(1);
    setTermFilter("all");
  }, [province, municipality]);

  const terms = useMemo(() => {
    return [...new Set(organizations.map((o) => o.term).filter(Boolean))].sort(
      (a, b) => b.localeCompare(a)
    );
  }, [organizations]);

  const filtered = useMemo(() => {
    let orgs = organizations;
    if (search) {
      const q = search.toLowerCase();
      orgs = orgs.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.officerName.toLowerCase().includes(q) ||
          o.position.toLowerCase().includes(q)
      );
    }
    if (termFilter !== "all") {
      orgs = orgs.filter((o) => o.term === termFilter);
    }
    return orgs.sort((a, b) => a.name.localeCompare(b.name));
  }, [organizations, search, termFilter]);

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
            Accredited Civil Society Organizations
          </h1>
          <p
            className="font-[family-name:var(--font-garamond)] mt-4 max-w-2xl text-sm text-white sm:text-lg lg:text-xl"
            style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
          >
            List of accredited Civil Society Organizations (CSOs) recognized by the
            Sangguniang Bayan ng {municipalityName}, {provinceName} through official
            resolutions.
          </p>
        </div>
      </section>

      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search organizations or officers..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="font-[family-name:var(--font-garamond)] h-9 pl-9 text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 lg:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <span className="font-[family-name:var(--font-garamond)] hidden whitespace-nowrap text-sm text-muted-foreground sm:inline">
              {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-2 hidden items-center gap-3 lg:flex">
            <span className="font-[family-name:var(--font-garamond)] text-sm font-medium text-muted-foreground">
              Filter by:
            </span>
            <Select
              value={termFilter}
              onValueChange={(v) => handleFilterChange(v, setTermFilter)}
            >
              <SelectTrigger className="font-[family-name:var(--font-garamond)] h-8 w-[160px] text-sm">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {terms.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="font-[family-name:var(--font-garamond)] text-sm text-muted-foreground">
              {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {showMobileFilters && (
            <div className="mt-3 flex flex-col gap-2 lg:hidden">
              <Select
                value={termFilter}
                onValueChange={(v) => handleFilterChange(v, setTermFilter)}
              >
                <SelectTrigger className="font-[family-name:var(--font-garamond)] h-9 text-sm">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {terms.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-garamond)] text-sm text-muted-foreground">
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
              Loading CSO organizations for {municipalityName}, {provinceName}...
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-[family-name:var(--font-garamond)] text-xl font-semibold">
              Unable to load organizations
            </h3>
            <p className="font-[family-name:var(--font-garamond)] mt-1 text-base text-muted-foreground">
              {loadError}
            </p>
            <Button className="mt-4" variant="outline" onClick={() => void loadOrganizations()}>
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-[family-name:var(--font-garamond)] text-xl font-semibold">
              No organizations found
            </h3>
            <p className="font-[family-name:var(--font-garamond)] mt-1 text-base text-muted-foreground">
              {organizations.length === 0
                ? `No accredited CSO organizations are available for ${municipalityName}, ${provinceName} yet.`
                : "Try adjusting the search or filters above."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead style={tableHeaderStyle}>
                  <tr>
                    <th className="font-[family-name:var(--font-garamond)] w-12 px-4 py-3 text-center text-sm font-semibold sm:text-base">
                      #
                    </th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-left text-sm font-semibold sm:text-base">
                      Name of Organization
                    </th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-left text-sm font-semibold sm:text-base">
                      Name of Officer(s)
                    </th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-center text-sm font-semibold sm:text-base">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrgs.map((org, index) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                        {startIndex + index + 1}
                      </td>
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-sm font-medium sm:text-base">
                        {org.name}
                      </td>
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-sm sm:text-base">
                        {org.officerName}
                      </td>
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                        {org.position}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of{" "}
                  {filtered.length} organizations
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
                      <span
                        key={`ellipsis-${i}`}
                        className="font-[family-name:var(--font-garamond)] px-2 text-sm text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={page === safePage ? "default" : "outline"}
                        size="icon"
                        className={`font-[family-name:var(--font-garamond)] h-8 w-8 text-sm font-medium ${
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

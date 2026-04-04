"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Users, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCSOOrganizations } from "@/lib/mock-data";

const YEARS = [
  ...new Set(mockCSOOrganizations.map((o) => o.founded)),
].sort((a, b) => b - a);

export default function CSOPage() {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let orgs = [...mockCSOOrganizations];
    if (search) {
      const q = search.toLowerCase();
      orgs = orgs.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.officerName.toLowerCase().includes(q) ||
          o.sbResolution.toLowerCase().includes(q)
      );
    }
    if (yearFilter !== "all") {
      orgs = orgs.filter((o) => o.founded.toString() === yearFilter);
    }
    return orgs.sort((a, b) => a.name.localeCompare(b.name));
  }, [search, yearFilter]);

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
                placeholder="Search organizations, officers, resolutions..."
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
              {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Desktop Filters */}
          <div className="mt-2 hidden items-center gap-3 lg:flex">
            <span className="text-xs font-medium text-muted-foreground">Filter by:</span>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Year Founded" />
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
            <span className="text-xs text-muted-foreground">
              {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="mt-3 flex flex-col gap-2 lg:hidden">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Year Founded" />
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
                {yearFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={() => setYearFilter("all")}
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
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead style={tableHeaderStyle}>
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold w-12">#</th>
                    <th className="px-4 py-3 text-left font-semibold">Name of Organization</th>
                    <th className="px-4 py-3 text-left font-semibold">Name of Officer(s)</th>
                    <th className="px-4 py-3 text-center font-semibold">Position</th>
                    <th className="px-4 py-3 text-center font-semibold">SB Resolution</th>
                    <th className="px-4 py-3 text-center font-semibold">Founded</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((org, index) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {index + 1}
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
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {org.sbResolution}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {org.founded}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {filtered.map((org, index) => (
                <Card
                  key={org.id}
                  className="transition-all duration-200 border-[#3998eb] hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-[#cbab53]/10 text-[#cbab53]"
                      >
                        <Users className="mr-1 h-3 w-3" />
                        CSO #{index + 1}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Est. {org.founded}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                      {org.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">Officer:</span>{" "}
                        {org.officerName}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Position:</span>{" "}
                        {org.position}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Resolution:</span>{" "}
                        {org.sbResolution}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

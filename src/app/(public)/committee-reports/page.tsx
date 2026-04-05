"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, FileText, SlidersHorizontal, X, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCommitteeReports } from "@/lib/mock-data";

const COMMITTEES = [
  ...new Set(mockCommitteeReports.map((r) => r.committee)),
].sort();

export default function CommitteeReportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let reports = [...mockCommitteeReports];
    if (search) {
      const q = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.reportNo.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.committee.toLowerCase().includes(q)
      );
    }
    if (committeeFilter !== "all") {
      reports = reports.filter((r) => r.committee === committeeFilter);
    }
    return reports;
  }, [search, committeeFilter]);

  const tableHeaderStyle = {
    backgroundColor: "#101B29",
    color: "white",
  };

  return (
    <div className="min-h-[70vh]">
      {/* Hero Section */}
      <section className="relative">
        <Image
          src="/images/sb/CommitteeReports-Background.png"
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
            Committee Reports
          </h1>
          <p
            className="mt-4 max-w-2xl text-sm sm:text-lg lg:text-xl text-white font-[family-name:var(--font-garamond)]"
            style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
          >
            Published committee reports from the standing committees of the
            Sangguniang Bayan ng Panglao.
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
                placeholder="Search by report no., subject, or committee..."
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
              {filtered.length} report{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Desktop Filters */}
          <div className="mt-2 hidden items-center gap-3 lg:flex">
            <span className="font-[family-name:var(--font-garamond)] text-sm font-medium text-muted-foreground">Filter by:</span>
            <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
              <SelectTrigger className="font-[family-name:var(--font-garamond)] h-8 w-[320px] text-sm">
                <SelectValue placeholder="Committee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Committees</SelectItem>
                {COMMITTEES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="font-[family-name:var(--font-garamond)] text-sm text-muted-foreground">
              {filtered.length} report{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="mt-3 flex flex-col gap-2 lg:hidden">
              <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
                <SelectTrigger className="font-[family-name:var(--font-garamond)] h-9 text-sm">
                  <SelectValue placeholder="Committee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Committees</SelectItem>
                  {COMMITTEES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-garamond)] text-sm text-muted-foreground">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
                {committeeFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={() => setCommitteeFilter("all")}
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
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-[family-name:var(--font-garamond)] text-xl font-semibold">No committee reports found</h3>
            <p className="font-[family-name:var(--font-garamond)] mt-1 text-base text-muted-foreground">
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
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-center text-sm font-semibold w-28 sm:text-base">Committee Report No.</th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-left text-sm font-semibold sm:text-base">Subject</th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-center text-sm font-semibold sm:text-base">Committee</th>
                    <th className="font-[family-name:var(--font-garamond)] px-4 py-3 text-center text-sm font-semibold w-24 sm:text-base">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-center text-sm font-medium sm:text-base">
                        {report.reportNo}
                      </td>
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-sm sm:text-base">
                        {report.subject}
                      </td>
                      <td className="font-[family-name:var(--font-garamond)] border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                        {report.committee}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            className="group relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#cbab53]/80 hover:bg-[#cbab53]/5 hover:text-[#cbab53]"
                            onClick={() => {
                              router.push(`/committee-reports/${report.id}`);
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

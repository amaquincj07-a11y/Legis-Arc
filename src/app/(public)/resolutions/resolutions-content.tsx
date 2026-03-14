"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Eye, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resolutions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-9 text-xs"
            />
          </div>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
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
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No resolutions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting the filters above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

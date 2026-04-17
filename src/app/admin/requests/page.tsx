"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockDocumentRequests } from "@/lib/mock-data";
import { X } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const MONTHS = [
  { value: "all", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function DocumentRequestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [fileType, setFileType] = useState("all");
  const [category, setCategory] = useState("all");

  // Get unique years from data
  const years = useMemo(() => {
    const y = Array.from(new Set(mockDocumentRequests.map(r => new Date(r.dateRequested).getFullYear())));
    return ["all", ...y.sort((a, b) => b - a)];
  }, []);

  // Get unique categories from data
  const categories = useMemo(() => {
    const cats = Array.from(new Set(mockDocumentRequests.map(r => r.category)));
    return ["all", ...cats];
  }, []);

  // Filtered data
  const filtered = useMemo(() => {
    return mockDocumentRequests.filter((r) => {
      const d = new Date(r.dateRequested);
      if (month !== "all" && d.getMonth() + 1 !== Number(month)) return false;
      if (year !== "all" && d.getFullYear().toString() !== year.toString()) return false;
      if (fileType !== "all" && r.fileType !== fileType) return false;
      if (category !== "all" && r.category !== category) return false;
      return true;
    });
  }, [month, year, fileType, category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = month !== "all" || year !== "all" || fileType !== "all" || category !== "all";

  function clearFilters() {
    setMonth("all");
    setYear("all");
    setFileType("all");
    setCategory("all");
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
          Document Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage all citizen document requests
        </p>
      </div>

      <Card className="overflow-hidden border border-slate-200/90 shadow-sm shadow-slate-900/5">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/80 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Month */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700" htmlFor="month-filter">
                  Month
                </label>
                <select
                  id="month-filter"
                  className="rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                >
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              {/* Year */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700" htmlFor="year-filter">
                  Year
                </label>
                <select
                  id="year-filter"
                  className="rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y === "all" ? "All Years" : y}</option>
                  ))}
                </select>
              </div>
              {/* File Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700" htmlFor="filetype-filter">
                  File Type
                </label>
                <select
                  id="filetype-filter"
                  className="rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  value={fileType}
                  onChange={e => setFileType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="ordinance">Ordinance</option>
                  <option value="resolution">Resolution</option>
                </select>
              </div>
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700" htmlFor="category-filter">
                  Category
                </label>
                <select
                  id="category-filter"
                  className="rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
                  ))}
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2 whitespace-nowrap"
              >
                <X className="size-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="text-xs font-semibold text-slate-700">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Address</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Purpose</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">File Type</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Ordinance/Resolution No.</TableHead>
                  <TableHead className="min-w-[300px] text-xs font-semibold text-slate-700">Title</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No requests found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((req, i) => (
                    <TableRow key={req.id || i} className="border-b border-slate-200 hover:bg-slate-50/50">
                      <TableCell className="text-sm text-slate-900">{new Date(req.dateRequested).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium text-slate-900">{req.name}</div>
                        <div className="text-xs text-muted-foreground break-all">{req.email}</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">{req.office}</TableCell>
                      <TableCell className="text-sm text-slate-700">{req.purpose}</TableCell>
                      <TableCell className="text-sm text-slate-700">{req.fileType}</TableCell>
                      <TableCell className="text-sm text-slate-700">{req.documentNumber}</TableCell>
                      <TableCell className="whitespace-normal break-words min-w-[300px] max-w-[500px] text-sm text-slate-700">{req.title}</TableCell>
                      <TableCell className="text-sm text-slate-700">{req.category}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/50 px-4 py-3">
        <div className="text-sm font-medium text-slate-700">
          Page {currentPage} of {totalPages} ({filtered.length} total requests)
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-xs"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              size="sm"
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
              className="text-xs"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { fetchDocumentDownloadLogsAction } from "@/lib/document-download-actions";
import { ADMIN_CACHE_KEYS } from "@/lib/admin-query-cache";
import type { DocumentDownloadRecord } from "@/lib/types";

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

const filterSelectClass =
  "h-10 w-full rounded-full border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:ring-[#3998eb] sm:h-9 sm:w-[150px]";

export default function DocumentRequestsPage() {
  const { data, loading } = useAdminQuery<DocumentDownloadRecord[]>(
    ADMIN_CACHE_KEYS.documentRequests,
    fetchDocumentDownloadLogsAction
  );
  const requests = data ?? [];

  const [currentPage, setCurrentPage] = useState(1);
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [fileType, setFileType] = useState("all");
  const [category, setCategory] = useState("all");

  const years = useMemo(() => {
    const y = Array.from(
      new Set(requests.map((r) => new Date(r.dateRequested).getFullYear()))
    );
    return ["all", ...y.sort((a, b) => b - a)];
  }, [requests]);

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(requests.map((r) => r.category).filter((c) => c && c !== "—"))
    );
    return ["all", ...cats.sort()];
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const d = new Date(r.dateRequested);
      if (month !== "all" && d.getMonth() + 1 !== Number(month)) return false;
      if (year !== "all" && d.getFullYear().toString() !== year.toString())
        return false;
      if (fileType !== "all" && r.fileType !== fileType) return false;
      if (category !== "all" && r.category !== category) return false;
      return true;
    });
  }, [requests, month, year, fileType, category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters =
    month !== "all" ||
    year !== "all" ||
    fileType !== "all" ||
    category !== "all";

  function clearFilters() {
    setMonth("all");
    setYear("all");
    setFileType("all");
    setCategory("all");
    setCurrentPage(1);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Document Requests"
        description="Track and manage all citizen document download requests"
      />

      <Card className="overflow-hidden border border-slate-200/90 shadow-sm shadow-slate-900/5">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/80 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <Select
              value={month}
              onValueChange={(v) => {
                setMonth(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className={filterSelectClass}>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={year.toString()}
              onValueChange={(v) => {
                setYear(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className={`${filterSelectClass} sm:w-[120px]`}>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y === "all" ? "All Years" : y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={fileType}
              onValueChange={(v) => {
                setFileType(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className={`${filterSelectClass} sm:w-[140px]`}>
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Ordinance">Ordinance</SelectItem>
                <SelectItem value="Resolution">Resolution</SelectItem>
                <SelectItem value="Minutes">Minutes</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className={filterSelectClass}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 gap-1.5 rounded-full px-3 text-xs font-medium text-slate-500 hover:text-slate-800 sm:h-9 lg:ml-auto"
              >
                <X className="size-4" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center px-4">
              <Loader2 className="mr-2 size-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading requests...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex h-32 items-center justify-center px-4">
              <p className="text-sm text-muted-foreground">
                No requests found for the selected filters.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y lg:hidden">
                {paginated.map((req) => (
                  <article key={req.id} className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {req.name}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {new Date(req.dateRequested).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800">{req.title}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full bg-[#3998eb]/8 px-2.5 py-1 font-medium text-[#3998eb]">
                        {req.fileType} {req.documentNumber}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                        {req.category}
                      </span>
                    </div>
                    <dl className="grid grid-cols-1 gap-1 pt-1 text-xs text-slate-600">
                      <div className="flex gap-1">
                        <dt className="font-medium text-slate-500">Office:</dt>
                        <dd>{req.office}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="font-medium text-slate-500">Purpose:</dt>
                        <dd>{req.purpose}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="text-xs font-semibold text-slate-700">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">
                        Name
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">
                        Office / Organization
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">
                        Purpose
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">
                        File Type
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">
                        Document No.
                      </TableHead>
                      <TableHead className="min-w-[300px] text-xs font-semibold text-slate-700">
                        Title
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">
                        Category
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((req) => (
                      <TableRow
                        key={req.id}
                        className="border-b border-slate-200 hover:bg-slate-50/50"
                      >
                        <TableCell className="text-sm text-slate-900">
                          {new Date(req.dateRequested).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-900">
                          {req.name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {req.office}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {req.purpose}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {req.fileType}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {req.documentNumber}
                        </TableCell>
                        <TableCell className="min-w-[300px] max-w-[500px] whitespace-normal wrap-break-word text-sm text-slate-700">
                          {req.title}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {req.category}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

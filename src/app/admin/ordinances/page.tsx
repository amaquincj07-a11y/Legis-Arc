"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, X, Pencil, Download, Eye, GlobeLock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { AdminIconAction } from "@/components/admin/admin-icon-action";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { mockOrdinances, mockCategories } from "@/lib/mock-data";
import { formatOrdinanceNumber } from "@/lib/utils";
import type { LegislativeDocument } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export default function OrdinancesPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<LegislativeDocument[]>([
    ...mockOrdinances,
  ]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<LegislativeDocument | null>(
    null
  );

  const years = useMemo(() => {
    const uniqueYears = [
      ...new Set(documents.map((d) => d.seriesYear)),
    ].sort((a, b) => b - a);
    return uniqueYears;
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !search || doc.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || doc.category === categoryFilter;
      const matchesYear =
        yearFilter === "all" || doc.seriesYear.toString() === yearFilter;
      return matchesSearch && matchesCategory && matchesYear;
    });
  }, [documents, search, categoryFilter, yearFilter]);

  function confirmDelete() {
    if (!deleteTarget) return;
    setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    toast.success(`Ordinance ${formatOrdinanceNumber(deleteTarget)} deleted`);
    setDeleteTarget(null);
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters =
    search || categoryFilter !== "all" || yearFilter !== "all";

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setYearFilter("all");
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
            Ordinances
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track all municipal ordinances
          </p>
        </div>
        <Button
          asChild
          className="gap-2 rounded-full bg-[#cbab53] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745] hover:shadow-lg hover:shadow-[#cbab53]/40"
        >
          <Link href="/admin/ordinances/new">
            <Plus className="size-4" />
            Upload New
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200/90 shadow-sm shadow-slate-900/5">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/80 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#3998eb]" />
              <Input
                placeholder="Search by title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 rounded-full border border-slate-200 bg-white/90 pl-11 pr-4 text-sm shadow-sm ring-0 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#3998eb]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={categoryFilter}
                onValueChange={(v) => {
                  setCategoryFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[170px] rounded-full border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:ring-[#3998eb]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockCategories
                    .filter((c) => c.isActive)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select
                value={yearFilter}
                onValueChange={(v) => {
                  setYearFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[120px] rounded-full border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:ring-[#3998eb]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 rounded-full px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  <X className="mr-1 size-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50/60">
                <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  No-Series
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Title
                </TableHead>
                <TableHead className="w-[160px] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Category
                </TableHead>
                <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Author / Sponsor
                </TableHead>
                <TableHead className="w-[200px] text-center text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <p className="text-sm text-muted-foreground">
                      No ordinances found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((doc) => {
                  const formattedNumber = formatOrdinanceNumber(doc);
                  return (
                    <TableRow
                      key={doc.id}
                      className="border-slate-100/90 transition hover:bg-slate-50"
                    >
                      <TableCell className="text-[13px] font-semibold text-slate-800">
                        {formattedNumber}
                      </TableCell>
                      <TableCell className="max-w-[360px] whitespace-normal wrap-break-word text-[13px] text-slate-800">
                        {doc.title}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-[#3998eb]/8 px-3 py-1 text-[11px] font-medium text-[#3998eb]">
                          {doc.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-700">
                        {doc.authorSponsor}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <AdminIconAction
                            label="Edit"
                            icon={Pencil}
                            variant="accent"
                            onClick={() =>
                              router.push(`/admin/ordinances/${doc.id}/edit`)
                            }
                          />
                          <AdminIconAction
                            label="Download PDF"
                            icon={Download}
                            variant="primary"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = doc.pdfUrl;
                              link.download = `${doc.title}.pdf`;
                              link.click();
                            }}
                          />
                          <AdminIconAction
                            label="View PDF"
                            icon={Eye}
                            variant="primary"
                            onClick={() => window.open(doc.pdfUrl, "_blank")}
                          />
                          <AdminIconAction
                            label="Unpublish"
                            icon={GlobeLock}
                            variant="danger"
                            onClick={() =>
                              toast.info(
                                "Unpublish will be available when connected to the server"
                              )
                            }
                          />
                          <AdminIconAction
                            label="Delete"
                            icon={Trash2}
                            variant="danger"
                            onClick={() => setDeleteTarget(doc)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {" "}
                {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this ordinance?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" (${formatOrdinanceNumber(deleteTarget)}) will be permanently removed. This cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}

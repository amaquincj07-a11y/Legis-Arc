"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Download, Eye, GlobeLock, Trash2 } from "lucide-react";

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
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { AdminPagination } from "@/components/admin/admin-pagination";
import type { AdminActionItem } from "@/components/admin/admin-actions-menu";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { useActiveCategories } from "@/hooks/use-active-categories";
import { useAdminQuery } from "@/hooks/use-admin-query";
import {
  deleteOrdinanceAction,
  fetchOrdinancesAction,
  toggleOrdinancePublishAction,
} from "@/lib/ordinance-actions";
import {
  ADMIN_CACHE_KEYS,
  invalidateAdminCache,
} from "@/lib/admin-query-cache";
import { openOrdinancePdf } from "@/lib/admin-document-pdf";
import { formatOrdinanceNumber } from "@/lib/utils";
import type { LegislativeDocument } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

const filterSelectClass =
  "h-10 w-full rounded-full border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:ring-[#3998eb] sm:h-9 sm:w-[170px]";

export default function OrdinancesPage() {
  const router = useRouter();
  const { categories } = useActiveCategories();
  const {
    data,
    loading,
    setData: setDocuments,
  } = useAdminQuery(ADMIN_CACHE_KEYS.ordinances, fetchOrdinancesAction);
  const documents = data ?? [];
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

  const getRowActions = useCallback(
    (doc: LegislativeDocument): AdminActionItem[] => [
      {
        label: "Edit",
        icon: Pencil,
        onClick: () => router.push(`/admin/ordinances/${doc.id}/edit`),
      },
      {
        label: "Download PDF",
        icon: Download,
        onClick: () => void openOrdinancePdf(doc.id, doc.title, "download"),
      },
      {
        label: "View PDF",
        icon: Eye,
        onClick: () => void openOrdinancePdf(doc.id, doc.title, "view"),
      },
      {
        label: "Unpublish",
        icon: GlobeLock,
        onClick: async () => {
          const result = await toggleOrdinancePublishAction(doc.id);
          if (result.success) {
            setDocuments((prev) =>
              prev.map((item) => (item.id === doc.id ? result.data : item))
            );
            toast.success(
              result.data.isPublic
                ? "Ordinance published"
                : "Ordinance unpublished"
            );
          } else {
            toast.error(result.error);
          }
        },
      },
      {
        label: "Delete",
        icon: Trash2,
        destructive: true,
        separatorBefore: true,
        onClick: () => setDeleteTarget(doc),
      },
    ],
    [router]
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    const result = await deleteOrdinanceAction(deleteTarget.id);
    if (result.success) {
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      invalidateAdminCache(ADMIN_CACHE_KEYS.dashboard);
      toast.success(
        `Ordinance ${formatOrdinanceNumber(deleteTarget)} deleted`
      );
      setDeleteTarget(null);
    } else {
      toast.error(result.error);
    }
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
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Ordinances"
        description="Manage and track all municipal ordinances"
        action={{
          label: "Upload New",
          href: "/admin/ordinances/new",
          icon: Plus,
        }}
      />

      <Card className="overflow-hidden border border-slate-200/90 shadow-sm shadow-slate-900/5">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/80 p-4 sm:pb-4">
          <AdminFilterBar
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search by title..."
            hasActiveFilters={Boolean(hasActiveFilters)}
            onClearFilters={clearFilters}
          >
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className={filterSelectClass}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
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
              <SelectTrigger className={`${filterSelectClass} sm:w-[120px]`}>
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
          </AdminFilterBar>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center px-4">
              <p className="text-sm text-muted-foreground">
                Loading ordinances...
              </p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex h-32 items-center justify-center px-4">
              <p className="text-sm text-muted-foreground">
                No ordinances found.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y lg:hidden">
                {paginated.map((doc) => {
                  const formattedNumber = formatOrdinanceNumber(doc);
                  return (
                    <article
                      key={doc.id}
                      className="space-y-3 p-4 transition hover:bg-slate-50/80"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#3998eb]">
                          {formattedNumber}
                        </p>
                        <h2 className="text-sm font-medium leading-snug text-slate-900">
                          {doc.title}
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="inline-flex items-center rounded-full bg-[#3998eb]/8 px-2.5 py-1 font-medium text-[#3998eb]">
                          {doc.category}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {doc.authorSponsor}
                        </span>
                      </div>
                      <AdminRowActions items={getRowActions(doc)} />
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto lg:block">
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
                      <TableHead className="min-w-[228px] w-[228px] text-center text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((doc) => {
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
                          <TableCell className="whitespace-nowrap">
                            <AdminRowActions items={getRowActions(doc)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

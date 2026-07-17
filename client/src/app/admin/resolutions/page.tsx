"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Download, Eye, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUploadTrigger } from "@/components/admin/admin-upload-trigger";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  AdminActionsMenu,
  type AdminActionItem,
} from "@/components/admin/admin-actions-menu";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { PublicVisibilityBadge } from "@/components/admin/public-visibility-badge";
import { createPublishVisibilityAction } from "@/lib/admin-document-visibility";
import { useActiveCategories } from "@/hooks/use-active-categories";
import { useAdminQuery } from "@/hooks/use-admin-query";
import {
  deleteResolutionAction,
  fetchResolutionsAction,
  toggleResolutionPublishAction,
} from "@/lib/resolution-actions";
import {
  ADMIN_CACHE_KEYS,
  invalidateAdminCache,
} from "@/lib/admin-query-cache";
import { openResolutionPdf } from "@/lib/admin-document-pdf";
import { formatResolutionNumber } from "@/lib/utils";
import type { LegislativeDocument } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

const filterSelectClass =
  "h-9 w-[150px] rounded-full border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:ring-[#3998eb] sm:w-[170px]";

export default function ResolutionsPage() {
  const router = useRouter();
  const { categories } = useActiveCategories();
  const {
    data,
    loading,
    setData: setDocuments,
  } = useAdminQuery(ADMIN_CACHE_KEYS.resolutions, fetchResolutionsAction);
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
        onClick: () => router.push(`/admin/resolutions/${doc.id}/edit`),
      },
      {
        label: "Download PDF",
        icon: Download,
        onClick: () =>
          void openResolutionPdf(doc.id, doc.title, "download", doc.pdfUrl),
      },
      {
        label: "View PDF",
        icon: Eye,
        onClick: () =>
          void openResolutionPdf(doc.id, doc.title, "view", doc.pdfUrl),
      },
      createPublishVisibilityAction(doc, async () => {
        const result = await toggleResolutionPublishAction(doc.id);
        if (result.success) {
          setDocuments((prev) =>
            prev.map((item) => (item.id === doc.id ? result.data : item))
          );
          invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
          toast.success(
            result.data.isPublic && result.data.status === "published"
              ? "Resolution published to public portal"
              : "Resolution removed from public portal"
          );
        } else {
          toast.error(result.error);
        }
      }),
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
    const target = deleteTarget;
    if (!target) return;
    const result = await deleteResolutionAction(target.id);
    if (result.success) {
      setDocuments((prev) => prev.filter((d) => d.id !== target.id));
      invalidateAdminCache(ADMIN_CACHE_KEYS.dashboard);
      invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
      toast.success(`Resolution ${formatResolutionNumber(target)} deleted`);
      setDeleteTarget(null);
    } else {
      toast.error(result.error);
      throw new Error(result.error);
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
        title="Resolutions"
        description="Manage and track all municipal resolutions"
      >
        <AdminUploadTrigger uploadHref="/admin/resolutions/new" />
      </AdminPageHeader>

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
                Loading resolutions...
              </p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex h-32 items-center justify-center px-4">
              <p className="text-sm text-muted-foreground">
                No resolutions found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto px-4 pt-4">
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-[#101B29] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold sm:text-base">
                      Resolution No.
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold sm:text-base">
                      Title
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold sm:text-base">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold sm:text-base">
                      Author/Sponsor
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold sm:text-base">
                      Visibility
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold sm:text-base">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((doc) => {
                    const formattedNumber = formatResolutionNumber(doc);
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                          {formattedNumber}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm sm:text-base">
                          {doc.title}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                          {doc.category}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm sm:text-base">
                          {doc.authorSponsor}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <PublicVisibilityBadge
                            status={doc.status}
                            isPublic={doc.isPublic}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <AdminActionsMenu items={getRowActions(doc)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
        title="Delete this resolution?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" (${formatResolutionNumber(deleteTarget)}) will be permanently removed. This cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}

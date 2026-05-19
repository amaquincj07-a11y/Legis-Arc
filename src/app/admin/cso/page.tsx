"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  Handshake,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminIconAction } from "@/components/admin/admin-icon-action";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { mockCSOOrganizations } from "@/lib/mock-data";
import { CSO_YEAR_TERMS } from "@/lib/constants";
import type { CSOOrganization } from "@/lib/types";

const ITEMS_PER_PAGE = 10;
const CUSTOM_TERM_VALUE = "__custom__";

type CSOFormState = {
  name: string;
  officerName: string;
  term: string;
  customTerm: string;
  position: string;
};

const emptyForm = (): CSOFormState => ({
  name: "",
  officerName: "",
  term: CSO_YEAR_TERMS[0],
  customTerm: "",
  position: "",
});

function resolveTerm(form: CSOFormState): string {
  if (form.term === CUSTOM_TERM_VALUE) {
    return form.customTerm.trim();
  }
  return form.term;
}

export default function AdminCSOPage() {
  const [organizations, setOrganizations] = useState<CSOOrganization[]>([
    ...mockCSOOrganizations,
  ]);
  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CSOOrganization | null>(null);
  const [form, setForm] = useState<CSOFormState>(emptyForm);

  const termOptions = useMemo(() => {
    const fromData = organizations.map((o) => o.term);
    return [...new Set([...CSO_YEAR_TERMS, ...fromData])].sort((a, b) =>
      b.localeCompare(a)
    );
  }, [organizations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return organizations
      .filter((org) => {
        const matchesSearch =
          !q ||
          org.name.toLowerCase().includes(q) ||
          org.officerName.toLowerCase().includes(q) ||
          org.position.toLowerCase().includes(q);
        const matchesTerm =
          termFilter === "all" || org.term === termFilter;
        return matchesSearch && matchesTerm;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [organizations, search, termFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const hasActiveFilters = Boolean(search) || termFilter !== "all";

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEditDialog(org: CSOOrganization) {
    const isCustomTerm = !(CSO_YEAR_TERMS as readonly string[]).includes(
      org.term
    );
    setEditingId(org.id);
    setForm({
      name: org.name,
      officerName: org.officerName,
      term: isCustomTerm ? CUSTOM_TERM_VALUE : org.term,
      customTerm: isCustomTerm ? org.term : "",
      position: org.position,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setOrganizations((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    toast.success("CSO removed");
    setDeleteTarget(null);
  }

  function handleSave() {
    const name = form.name.trim();
    const officerName = form.officerName.trim();
    const term = resolveTerm(form);
    const position = form.position.trim();

    if (!name) {
      toast.error("Please enter the name of the association");
      return;
    }
    if (!officerName) {
      toast.error("Please enter the name of the officer");
      return;
    }
    if (!term) {
      toast.error("Please select or enter a year term");
      return;
    }
    if (!position) {
      toast.error("Please enter the position");
      return;
    }

    if (editingId) {
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === editingId
            ? { ...org, name, officerName, term, position }
            : org
        )
      );
      toast.success("CSO updated");
    } else {
      const newOrg: CSOOrganization = {
        id: `cso-${Date.now()}`,
        name,
        officerName,
        term,
        position,
      };
      setOrganizations((prev) => [newOrg, ...prev]);
      toast.success("CSO added");
      setCurrentPage(1);
    }
    closeDialog();
  }

  function getPageNumbers(): (number | "ellipsis")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (safePage > 3) pages.push("ellipsis");
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#3998eb]/10 text-[#3998eb]">
            <Handshake className="size-5" />
          </div>
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              CSO
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Manage accredited Civil Society Organizations — add associations,
              officers, and term details for the public CSO directory.
            </p>
          </div>
        </div>
        <Button
          onClick={openAddDialog}
          className="gap-2 rounded-full bg-[#cbab53] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745]"
        >
          <Plus className="size-4" />
          Add CSO
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200/90 shadow-sm shadow-slate-900/5">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/80 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#3998eb]" />
              <Input
                placeholder="Search association, officer, or position..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 rounded-full border border-slate-200 bg-white/90 pl-11 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#3998eb]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={termFilter}
                onValueChange={(value) => {
                  setTermFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[160px] rounded-full border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm">
                  <SelectValue placeholder="Year term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All year terms</SelectItem>
                  {termOptions.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setTermFilter("all");
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-full px-3 text-xs font-medium text-slate-600"
                >
                  <X className="mr-1 size-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} organizations
          </p>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50/60">
                <TableHead className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Name of the Association
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Name of Officer
                </TableHead>
                <TableHead className="w-[22%] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Position
                </TableHead>
                <TableHead className="w-[120px] text-center text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-36 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Handshake className="size-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        No CSO entries found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {organizations.length === 0
                          ? "Click Add CSO to register your first organization."
                          : "Try adjusting your search or year term filter."}
                      </p>
                      {organizations.length === 0 && (
                        <Button
                          size="sm"
                          className="mt-2 rounded-full"
                          onClick={openAddDialog}
                        >
                          <Plus className="mr-1 size-4" />
                          Add CSO
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((org) => (
                  <TableRow
                    key={org.id}
                    className="border-slate-100/90 hover:bg-slate-50/80"
                  >
                    <TableCell className="py-4 text-[13px] font-medium text-slate-800">
                      {org.name}
                    </TableCell>
                    <TableCell className="py-4 text-[13px] text-slate-700">
                      {org.officerName}
                    </TableCell>
                    <TableCell className="py-4 text-[13px] text-slate-700">
                      {org.position}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <AdminIconAction
                          label="Edit"
                          icon={Pencil}
                          variant="accent"
                          onClick={() => openEditDialog(org)}
                        />
                        <AdminIconAction
                          label="Delete"
                          icon={Trash2}
                          variant="danger"
                          onClick={() => setDeleteTarget(org)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200/60 bg-slate-50/50 px-4 py-3 sm:flex-row">
          <p className="text-sm font-medium text-slate-700">
            Page {safePage} of {totalPages} ({filtered.length} total)
          </p>
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(safePage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {getPageNumbers().map((page, i) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  variant={page === safePage ? "default" : "outline"}
                  size="icon"
                  className={`size-8 text-sm ${
                    page === safePage
                      ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
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
              className="size-8"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </nav>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add CSO</DialogTitle>
            <DialogDescription>
              Enter the civil society organization details. All fields are
              required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cso-name">
                Name of the Association{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cso-name"
                placeholder="e.g. Panglao Island Fisherfolk Association"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cso-officer">
                Name of Officer <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cso-officer"
                placeholder="e.g. Roberto M. Salazar"
                value={form.officerName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, officerName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cso-term">
                Year term <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.term}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, term: value }))
                }
              >
                <SelectTrigger id="cso-term">
                  <SelectValue placeholder="Select year term" />
                </SelectTrigger>
                <SelectContent>
                  {CSO_YEAR_TERMS.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_TERM_VALUE}>
                    Other (type manually)
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.term === CUSTOM_TERM_VALUE && (
                <Input
                  placeholder="e.g. 2016-2019"
                  value={form.customTerm}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customTerm: e.target.value,
                    }))
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cso-position">
                Position <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cso-position"
                placeholder="e.g. President"
                value={form.position}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, position: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#cbab53] text-slate-900 hover:bg-[#b89745]"
              onClick={handleSave}
            >
              {editingId ? "Save changes" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this CSO?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from the directory.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}

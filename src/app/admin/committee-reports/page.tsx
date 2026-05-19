"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  Eye,
  Download,
  Upload,
  Pencil,
  Globe,
  GlobeLock,
  Trash2,
} from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AdminActionsMenu } from "@/components/admin/admin-actions-menu";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { mockCommitteeReports } from "@/lib/mock-data";
import type { CommitteeReport } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

const COMMITTEES = [
  ...new Set(mockCommitteeReports.map((r) => r.committee)),
].sort();

export default function AdminCommitteeReportsPage() {
  const [reports, setReports] = useState<CommitteeReport[]>(
    mockCommitteeReports.map((r) => ({ ...r, isPublished: r.isPublished ?? true }))
  );
  const [search, setSearch] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CommitteeReport | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadReportNo, setUploadReportNo] = useState("");
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadCommittee, setUploadCommittee] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        report.reportNo.toLowerCase().includes(q) ||
        report.subject.toLowerCase().includes(q) ||
        report.committee.toLowerCase().includes(q);
      const matchesCommittee =
        committeeFilter === "all" || report.committee === committeeFilter;
      return matchesSearch && matchesCommittee;
    });
  }, [reports, search, committeeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = search || committeeFilter !== "all";

  function clearFilters() {
    setSearch("");
    setCommitteeFilter("all");
    setCurrentPage(1);
  }

  function resetUploadForm() {
    setUploadReportNo("");
    setUploadSubject("");
    setUploadCommittee("");
    setUploadFile(null);
  }

  function openEditDialog(report: CommitteeReport) {
    setEditingId(report.id);
    setUploadReportNo(report.reportNo);
    setUploadSubject(report.subject);
    setUploadCommittee(report.committee);
    setUploadFile(null);
    setEditOpen(true);
  }

  function handleUpload() {
    if (!uploadReportNo.trim() || !uploadSubject.trim() || !uploadCommittee) return;

    const newReport: CommitteeReport = {
      id: `cr-${Date.now()}`,
      reportNo: uploadReportNo.trim(),
      subject: uploadSubject.trim(),
      committee: uploadCommittee,
      pdfUrl: uploadFile ? URL.createObjectURL(uploadFile) : "",
      isPublished: false,
    };

    setReports((prev) => [newReport, ...prev]);
    toast.success("Report uploaded as draft — publish when ready");
    resetUploadForm();
    setUploadOpen(false);
    setCurrentPage(1);
  }

  function handleEditSave() {
    if (!editingId || !uploadReportNo.trim() || !uploadSubject.trim() || !uploadCommittee)
      return;

    setReports((prev) =>
      prev.map((r) =>
        r.id === editingId
          ? {
              ...r,
              reportNo: uploadReportNo.trim(),
              subject: uploadSubject.trim(),
              committee: uploadCommittee,
              ...(uploadFile ? { pdfUrl: URL.createObjectURL(uploadFile) } : {}),
            }
          : r
      )
    );
    toast.success("Report updated");
    resetUploadForm();
    setEditOpen(false);
    setEditingId(null);
  }

  function togglePublish(report: CommitteeReport) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === report.id ? { ...r, isPublished: !r.isPublished } : r
      )
    );
    toast.success(
      report.isPublished
        ? `${report.reportNo} unpublished`
        : `${report.reportNo} published to the public site`
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setReports((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast.success("Committee report deleted");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
            Committee Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage committee reports from the standing committees
          </p>
        </div>

        <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetUploadForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full bg-[#cbab53] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745] hover:shadow-lg hover:shadow-[#cbab53]/40">
              <Plus className="size-4" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Upload Committee Report</DialogTitle>
              <DialogDescription>
                Add a new committee report with its document file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reportNo">Report No. *</Label>
                <Input
                  id="reportNo"
                  placeholder="e.g. CR 55"
                  value={uploadReportNo}
                  onChange={(e) => setUploadReportNo(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject *</Label>
                <Textarea
                  id="subject"
                  placeholder="Enter the subject of the report..."
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="committee">Committee *</Label>
                <Select value={uploadCommittee} onValueChange={setUploadCommittee}>
                  <SelectTrigger id="committee">
                    <SelectValue placeholder="Select a committee" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMITTEES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pdfFile">Upload Document (PDF)</Label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="pdfFile"
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-600 transition hover:border-[#cbab53] hover:bg-[#cbab53]/5"
                  >
                    <Upload className="size-4" />
                    {uploadFile ? uploadFile.name : "Choose PDF file..."}
                  </label>
                  <input
                    id="pdfFile"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadFile(file);
                    }}
                  />
                  {uploadFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-slate-500"
                      onClick={() => setUploadFile(null)}
                    >
                      <X className="size-3 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetUploadForm(); setUploadOpen(false); }}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadReportNo.trim() || !uploadSubject.trim() || !uploadCommittee}
                className="bg-[#cbab53] text-slate-900 hover:bg-[#b89745]"
              >
                Upload Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) {
              resetUploadForm();
              setEditingId(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Edit Committee Report</DialogTitle>
              <DialogDescription>
                Update the report details. Upload a new PDF only if you want to replace the file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-reportNo">Report No. *</Label>
                <Input
                  id="edit-reportNo"
                  value={uploadReportNo}
                  onChange={(e) => setUploadReportNo(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subject">Subject *</Label>
                <Textarea
                  id="edit-subject"
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-committee">Committee *</Label>
                <Select value={uploadCommittee} onValueChange={setUploadCommittee}>
                  <SelectTrigger id="edit-committee">
                    <SelectValue placeholder="Select a committee" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMITTEES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-pdfFile">Replace PDF (optional)</Label>
                <label
                  htmlFor="edit-pdfFile"
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-600"
                >
                  <Upload className="size-4" />
                  {uploadFile ? uploadFile.name : "Choose new PDF..."}
                </label>
                <input
                  id="edit-pdfFile"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadFile(file);
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetUploadForm();
                  setEditOpen(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={
                  !uploadReportNo.trim() || !uploadSubject.trim() || !uploadCommittee
                }
                className="bg-[#cbab53] text-slate-900 hover:bg-[#b89745]"
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden border border-slate-200/90 shadow-sm shadow-slate-900/5">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/80 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#3998eb]" />
              <Input
                placeholder="Search by report no., subject, or committee..."
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
                value={committeeFilter}
                onValueChange={(v) => {
                  setCommitteeFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[280px] rounded-full border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:ring-[#3998eb]">
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
                <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Report No.
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Subject
                </TableHead>
                <TableHead className="w-[240px] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Committee
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Status
                </TableHead>
                <TableHead className="w-[120px] text-center text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <p className="text-sm text-muted-foreground">
                      No committee reports found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((report) => (
                  <TableRow
                    key={report.id}
                    className="border-slate-100/90 transition hover:bg-slate-50"
                  >
                    <TableCell className="text-[13px] font-semibold text-slate-800">
                      {report.reportNo}
                    </TableCell>
                    <TableCell className="max-w-[400px] whitespace-normal wrap-break-word text-[13px] text-slate-800">
                      {report.subject}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-[#3998eb]/8 px-3 py-1 text-[11px] font-medium text-[#3998eb]">
                        {report.committee}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={report.isPublished ? "default" : "secondary"}
                        className={
                          report.isPublished
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                        }
                      >
                        {report.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AdminActionsMenu
                        items={[
                          {
                            label: "Edit",
                            icon: Pencil,
                            onClick: () => openEditDialog(report),
                          },
                          {
                            label: report.isPublished ? "Unpublish" : "Publish",
                            icon: report.isPublished ? GlobeLock : Globe,
                            onClick: () => togglePublish(report),
                          },
                          {
                            label: "View PDF",
                            icon: Eye,
                            onClick: () => {
                              if (report.pdfUrl) window.open(report.pdfUrl, "_blank");
                            },
                          },
                          {
                            label: "Download",
                            icon: Download,
                            onClick: () => {
                              if (report.pdfUrl) {
                                const link = document.createElement("a");
                                link.href = report.pdfUrl;
                                link.download = `${report.reportNo}.pdf`;
                                link.click();
                              }
                            },
                          },
                          {
                            label: "Delete",
                            icon: Trash2,
                            destructive: true,
                            separatorBefore: true,
                            onClick: () => setDeleteTarget(report),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
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
        title="Delete this report?"
        description={
          deleteTarget
            ? `"${deleteTarget.reportNo}" will be permanently removed. This cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}

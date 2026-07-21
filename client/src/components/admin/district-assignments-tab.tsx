"use client";

import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { MapPinned, Plus, Search, Loader2, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  createDistrictAssignmentAction,
  deleteDistrictAssignmentAction,
  fetchDistrictAssignmentsPageDataAction,
  updateDistrictAssignmentAction,
} from "@/lib/district-assignment-actions";
import { ADMIN_CACHE_KEYS, invalidateAdminCache } from "@/lib/admin-query-cache";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { formatBarangayLabel } from "@/lib/mappers/district-assignment-mapper";
import { formatSBMemberDisplayName } from "@/lib/utils";
import type { DistrictAssignment, SBMember } from "@/lib/types";

type FormState = {
  barangayName: string;
  sbMemberId: string;
};

const emptyForm = (): FormState => ({
  barangayName: "",
  sbMemberId: "",
});

export function DistrictAssignmentsTab() {
  const { data, loading, setData } = useAdminQuery(
    ADMIN_CACHE_KEYS.districtAssignments,
    fetchDistrictAssignmentsPageDataAction
  );
  const assignments = data?.assignments ?? [];
  const sbMembers = data?.sbMembers ?? [];
  const barangays = data?.barangays ?? [];

  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<DistrictAssignment | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const updatePageData = useCallback(
    (
      updater: (current: {
        assignments: DistrictAssignment[];
        sbMembers: SBMember[];
        barangays: string[];
      }) => {
        assignments: DistrictAssignment[];
        sbMembers: SBMember[];
        barangays: string[];
      }
    ) => {
      setData((current) => {
        const base = current ?? {
          assignments: [],
          sbMembers: [],
          barangays: [],
        };
        return updater(base);
      });
    },
    [setData]
  );

  const filledSbMembers = useMemo(
    () => sbMembers.filter((m) => m.name.trim()),
    [sbMembers]
  );

  const assignedBarangays = useMemo(() => {
    const set = new Set(
      assignments
        .filter((a) => a.id !== editingId)
        .map((a) => a.barangayName.toUpperCase())
    );
    return set;
  }, [assignments, editingId]);

  const availableBarangays = useMemo(
    () =>
      barangays.filter(
        (name) =>
          !assignedBarangays.has(name.toUpperCase()) ||
          form.barangayName.toUpperCase() === name.toUpperCase()
      ),
    [barangays, assignedBarangays, form.barangayName]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(
      (assignment) =>
        assignment.barangayName.toLowerCase().includes(q) ||
        assignment.sbMemberName.toLowerCase().includes(q)
    );
  }, [assignments, search]);

  function openAddDialog() {
    if (filledSbMembers.length === 0) {
      toast.error("Add SB Members first before creating district assignments.");
      return;
    }
    if (barangays.length === 0) {
      toast.error("No barangays found for this LGU.");
      return;
    }
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEditDialog(assignment: DistrictAssignment) {
    if (filledSbMembers.length === 0) {
      toast.error("Add SB Members first before editing district assignments.");
      return;
    }
    setEditingId(assignment.id);
    setForm({
      barangayName: assignment.barangayName,
      sbMemberId: assignment.sbMemberId,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  async function handleSave() {
    if (!form.barangayName) {
      toast.error("Select a barangay.");
      return;
    }
    if (!form.sbMemberId) {
      toast.error("Select an SB member.");
      return;
    }

    setSaving(true);
    const result = editingId
      ? await updateDistrictAssignmentAction(editingId, form)
      : await createDistrictAssignmentAction(form);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    updatePageData((current) => {
      if (editingId) {
        return {
          ...current,
          assignments: current.assignments
            .map((item) => (item.id === editingId ? result.data : item))
            .toSorted((a, b) =>
              a.barangayName.localeCompare(b.barangayName)
            ),
        };
      }
      return {
        ...current,
        assignments: [...current.assignments, result.data].toSorted((a, b) =>
          a.barangayName.localeCompare(b.barangayName)
        ),
      };
    });
    invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
    toast.success(
      editingId ? "District assignment updated." : "District assignment added."
    );
    closeDialog();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteDistrictAssignmentAction(deleteTarget.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    updatePageData((current) => ({
      ...current,
      assignments: current.assignments.filter(
        (item) => item.id !== deleteTarget.id
      ),
    }));
    invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
    toast.success("District assignment deleted.");
    setDeleteTarget(null);
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Loading district assignments…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search barangay or member…"
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          onClick={openAddDialog}
          className="rounded-full bg-[#cbab53] text-slate-900 hover:bg-[#b89745]"
        >
          <Plus className="mr-1.5 size-4" />
          Add District Assignment
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MapPinned className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">
              {assignments.length === 0
                ? "No district assignments yet"
                : "No matching assignments"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {assignments.length === 0
                ? "Assign each barangay to an SB member for the public SB chart."
                : "Try a different search term."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {formatBarangayLabel(assignment.barangayName)}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {assignment.sbMemberName}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Edit district assignment"
                  onClick={() => openEditDialog(assignment)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  aria-label="Delete district assignment"
                  onClick={() => setDeleteTarget(assignment)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit District Assignment" : "Add District Assignment"}
            </DialogTitle>
            <DialogDescription>
              Choose a barangay of this LGU and the SB member assigned to it.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="district-barangay">
                Barangay <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.barangayName || undefined}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, barangayName: value }))
                }
              >
                <SelectTrigger id="district-barangay" className="w-full">
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  {availableBarangays.map((name) => (
                    <SelectItem key={name} value={name}>
                      {formatBarangayLabel(name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district-member">
                SB Member <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.sbMemberId || undefined}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, sbMemberId: value }))
                }
              >
                <SelectTrigger id="district-member" className="w-full">
                  <SelectValue placeholder="Select from SB Members" />
                </SelectTrigger>
                <SelectContent>
                  {filledSbMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {formatSBMemberDisplayName(member)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              className="rounded-full bg-[#cbab53] text-slate-900 hover:bg-[#b89745]"
              onClick={() => void handleSave()}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : editingId ? (
                "Save changes"
              ) : (
                "Add assignment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this assignment?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `${formatBarangayLabel(deleteTarget.barangayName)} — ${deleteTarget.sbMemberName} will be removed.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

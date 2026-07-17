"use client";

import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  UsersRound,
  UserPlus,
  GripVertical,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminCommitteeCard } from "@/components/admin/admin-committee-card";
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
  createCommitteeAction,
  deleteCommitteeAction,
  fetchCommitteeDetailAction,
  fetchCommitteesPageDataAction,
  updateCommitteeAction,
} from "@/lib/committee-actions";
import { ADMIN_CACHE_KEYS, invalidateAdminCache } from "@/lib/admin-query-cache";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { formatSBMemberDisplayName } from "@/lib/utils";
import type { Committee, SBMember } from "@/lib/types";

type CommitteeFormState = {
  name: string;
  chairmanId: string;
  viceChairmanId: string;
  memberIds: string[];
};

const emptyForm = (): CommitteeFormState => ({
  name: "",
  chairmanId: "",
  viceChairmanId: "",
  memberIds: [""],
});

function SBMemberSelect({
  id,
  label,
  value,
  members,
  onChange,
  required,
}: {
  id: string;
  label: string;
  value: string;
  members: SBMember[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select from SB Members" />
        </SelectTrigger>
        <SelectContent>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {formatSBMemberDisplayName(member)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CommitteesTab() {
  const {
    data,
    loading,
    setData,
  } = useAdminQuery(ADMIN_CACHE_KEYS.committees, fetchCommitteesPageDataAction);
  const committees = data?.committees ?? [];
  const sbMembers = data?.sbMembers ?? [];
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CommitteeFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Committee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const updatePageData = useCallback(
    (
      updater: (current: {
        committees: Committee[];
        sbMembers: SBMember[];
      }) => { committees: Committee[]; sbMembers: SBMember[] }
    ) => {
      setData((current) => {
        const base = current ?? { committees: [], sbMembers: [] };
        return updater(base);
      });
    },
    [setData]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return committees;
    return committees.filter(
      (committee) =>
        committee.name.toLowerCase().includes(q) ||
        committee.chairman.toLowerCase().includes(q) ||
        committee.viceChairman.toLowerCase().includes(q) ||
        committee.members.some((m) => m.toLowerCase().includes(q))
    );
  }, [committees, search]);

  const hasActiveFilters = Boolean(search);

  const filledSbMembers = useMemo(
    () => sbMembers.filter((m) => m.name.trim()),
    [sbMembers]
  );

  function openAddDialog() {
    if (filledSbMembers.length === 0) {
      toast.error("Add SB Members first before creating committees.");
      return;
    }
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  async function openEditDialog(committee: Committee) {
    if (filledSbMembers.length === 0) {
      toast.error("Add SB Members first before editing committees.");
      return;
    }

    const result = await fetchCommitteeDetailAction(committee.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setEditingId(committee.id);
    setForm({
      name: result.data.name,
      chairmanId: result.data.chairmanId,
      viceChairmanId: result.data.viceChairmanId,
      memberIds:
        result.data.memberIds.length > 0 ? [...result.data.memberIds] : [""],
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  function updateMember(index: number, value: string) {
    setForm((prev) => {
      const memberIds = [...prev.memberIds];
      memberIds[index] = value;
      return { ...prev, memberIds };
    });
  }

  function addMemberRow() {
    setForm((prev) => ({ ...prev, memberIds: [...prev.memberIds, ""] }));
  }

  function removeMemberRow(index: number) {
    setForm((prev) => {
      const memberIds = prev.memberIds.filter((_, i) => i !== index);
      return { ...prev, memberIds: memberIds.length > 0 ? memberIds : [""] };
    });
  }

  async function handleSave() {
    const name = form.name.trim();
    const chairmanId = form.chairmanId.trim();
    const viceChairmanId = form.viceChairmanId.trim();
    const memberIds = form.memberIds.map((id) => id.trim()).filter(Boolean);

    if (!name) {
      toast.error("Please enter the committee title");
      return;
    }
    if (!chairmanId) {
      toast.error("Please select a Chairman");
      return;
    }
    if (!viceChairmanId) {
      toast.error("Please select a Vice-Chairman");
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("chairmanId", chairmanId);
    formData.set("viceChairmanId", viceChairmanId);
    formData.set("memberIds", JSON.stringify(memberIds));

    setSaving(true);
    const result = editingId
      ? await updateCommitteeAction(editingId, formData)
      : await createCommitteeAction(formData);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (editingId) {
      updatePageData((current) => ({
        ...current,
        committees: current.committees.map((c) =>
          c.id === editingId ? result.data : c
        ),
      }));
      toast.success("Committee updated");
    } else {
      updatePageData((current) => ({
        ...current,
        committees: [...current.committees, result.data].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }));
      toast.success("Committee added");
    }

    invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
    closeDialog();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    const result = await deleteCommitteeAction(deleteTarget.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    updatePageData((current) => ({
      ...current,
      committees: current.committees.filter((c) => c.id !== deleteTarget.id),
    }));
    invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
    toast.success("Committee removed");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          Manage standing committees and assign leadership from your SB Members
          roster.
        </p>
        <Button
          onClick={openAddDialog}
          disabled={loading}
          className="gap-2 rounded-full bg-[#cbab53] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745]"
        >
          <Plus className="size-4" />
          Add Committee
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200/90 shadow-sm shadow-slate-900/5">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/80 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#3998eb]" />
              <Input
                placeholder="Search committee, chairman, or member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-full border border-slate-200 bg-white/90 pl-11 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#3998eb]"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
                className="h-9 rounded-full px-3 text-xs font-medium text-slate-600"
              >
                <X className="mr-1 size-4" />
                Clear search
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {committees.length} committees
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="mb-3 size-8 animate-spin text-[#3998eb]" />
              <p className="text-sm text-muted-foreground">
                Loading committees…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UsersRound className="mb-3 size-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                No committees found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {committees.length === 0
                  ? "Click Add Committee to create your first entry."
                  : "Try adjusting your search."}
              </p>
              {committees.length === 0 && (
                <Button
                  size="sm"
                  className="mt-4 rounded-full"
                  onClick={openAddDialog}
                >
                  <Plus className="mr-1 size-4" />
                  Add Committee
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {filtered.map((committee) => (
                <AdminCommitteeCard
                  key={committee.id}
                  committee={committee}
                  onEdit={() => void openEditDialog(committee)}
                  onDelete={() => setDeleteTarget(committee)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Committee" : "Add Committee"}
            </DialogTitle>
            <DialogDescription>
              Select chairman, vice-chairman, and members from your SB Members
              roster.
            </DialogDescription>
          </DialogHeader>

          {filledSbMembers.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No SB Members found. Please add members in the SB Members tab before
              creating committees.
            </p>
          ) : (
            <div className="space-y-6 py-2">
              <section className="space-y-4 rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  1. Committee details
                </p>
                <div className="space-y-2">
                  <Label htmlFor="committee-title">
                    Committee title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="committee-title"
                    placeholder="e.g. Committee on Education"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  2. Leadership
                </p>
                <SBMemberSelect
                  id="chairman"
                  label="Chairman"
                  value={form.chairmanId}
                  members={filledSbMembers}
                  onChange={(chairmanId) =>
                    setForm((prev) => ({ ...prev, chairmanId }))
                  }
                  required
                />
                <SBMemberSelect
                  id="vice-chairman"
                  label="Vice-Chairman"
                  value={form.viceChairmanId}
                  members={filledSbMembers}
                  onChange={(viceChairmanId) =>
                    setForm((prev) => ({ ...prev, viceChairmanId }))
                  }
                  required
                />
              </section>

              <section className="space-y-3 rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    3. Members
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 rounded-full text-xs"
                    onClick={addMemberRow}
                  >
                    <UserPlus className="size-3.5" />
                    Add member
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional. Leave blank rows empty — they will be ignored when
                  you save.
                </p>
                <div className="space-y-2">
                  {form.memberIds.map((memberId, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripVertical className="size-4 shrink-0 text-slate-300" />
                      <Select
                        value={memberId || undefined}
                        onValueChange={(value) => updateMember(index, value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={`Member ${index + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {filledSbMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {formatSBMemberDisplayName(member)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-slate-400 hover:text-rose-600"
                        onClick={() => removeMemberRow(index)}
                        disabled={form.memberIds.length === 1}
                        aria-label="Remove member"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || filledSbMembers.length === 0}
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
                "Add committee"
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
            <DialogTitle>Delete this committee?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name} will be removed. This cannot be undone.
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

"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  UsersRound,
  UserPlus,
  GripVertical,
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
import { mockCommittees } from "@/lib/mock-data";
import { COMMITTEE_YEAR_TERMS } from "@/lib/constants";
import type { Committee } from "@/lib/types";

const CUSTOM_TERM_VALUE = "__custom__";

type CommitteeFormState = {
  name: string;
  yearTerm: string;
  customYearTerm: string;
  chairman: string;
  viceChairman: string;
  members: string[];
};

const emptyForm = (): CommitteeFormState => ({
  name: "",
  yearTerm: COMMITTEE_YEAR_TERMS[0],
  customYearTerm: "",
  chairman: "",
  viceChairman: "",
  members: [""],
});

function resolveYearTerm(form: CommitteeFormState): string {
  if (form.yearTerm === CUSTOM_TERM_VALUE) {
    return form.customYearTerm.trim();
  }
  return form.yearTerm;
}

export default function CommitteesPage() {
  const [committees, setCommittees] = useState<Committee[]>([...mockCommittees]);
  const [search, setSearch] = useState("");
  const [yearTermFilter, setYearTermFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);
  const [form, setForm] = useState<CommitteeFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Committee | null>(null);

  const yearTermOptions = useMemo(() => {
    const fromData = committees.map((c) => c.yearTerm);
    const presets = [...COMMITTEE_YEAR_TERMS];
    return [...new Set([...presets, ...fromData])].sort((a, b) =>
      b.localeCompare(a)
    );
  }, [committees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return committees.filter((committee) => {
      const matchesSearch =
        !q ||
        committee.name.toLowerCase().includes(q) ||
        committee.chairman.toLowerCase().includes(q) ||
        committee.viceChairman.toLowerCase().includes(q) ||
        committee.members.some((m) => m.toLowerCase().includes(q));
      const matchesYear =
        yearTermFilter === "all" || committee.yearTerm === yearTermFilter;
      return matchesSearch && matchesYear;
    });
  }, [committees, search, yearTermFilter]);

  const hasActiveFilters = search || yearTermFilter !== "all";

  function openAddDialog() {
    setEditingCommittee(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEditDialog(committee: Committee) {
    const isPreset = (COMMITTEE_YEAR_TERMS as readonly string[]).includes(
      committee.yearTerm
    );
    setEditingCommittee(committee);
    setForm({
      name: committee.name,
      yearTerm: isPreset ? committee.yearTerm : CUSTOM_TERM_VALUE,
      customYearTerm: isPreset ? "" : committee.yearTerm,
      chairman: committee.chairman,
      viceChairman: committee.viceChairman,
      members: committee.members.length > 0 ? [...committee.members] : [""],
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingCommittee(null);
    setForm(emptyForm());
  }

  function updateMember(index: number, value: string) {
    setForm((prev) => {
      const members = [...prev.members];
      members[index] = value;
      return { ...prev, members };
    });
  }

  function addMemberRow() {
    setForm((prev) => ({ ...prev, members: [...prev.members, ""] }));
  }

  function removeMemberRow(index: number) {
    setForm((prev) => {
      const members = prev.members.filter((_, i) => i !== index);
      return { ...prev, members: members.length > 0 ? members : [""] };
    });
  }

  function handleSave() {
    const name = form.name.trim();
    const yearTerm = resolveYearTerm(form);
    const chairman = form.chairman.trim();
    const viceChairman = form.viceChairman.trim();
    const members = form.members.map((m) => m.trim()).filter(Boolean);

    if (!name) {
      toast.error("Please enter the committee title");
      return;
    }
    if (!yearTerm) {
      toast.error("Please select or enter a year term");
      return;
    }
    if (!chairman) {
      toast.error("Please enter the Chairman");
      return;
    }
    if (!viceChairman) {
      toast.error("Please enter the Vice-Chairman");
      return;
    }

    if (editingCommittee) {
      setCommittees((prev) =>
        prev.map((c) =>
          c.id === editingCommittee.id
            ? { ...c, name, yearTerm, chairman, viceChairman, members }
            : c
        )
      );
      toast.success("Committee updated");
    } else {
      const newCommittee: Committee = {
        id: `com-${Date.now()}`,
        name,
        yearTerm,
        chairman,
        viceChairman,
        members,
      };
      setCommittees((prev) => [newCommittee, ...prev]);
      toast.success("Committee added");
    }

    closeDialog();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setCommittees((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success("Committee removed");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#3998eb]/10 text-[#3998eb]">
            <UsersRound className="size-5" />
          </div>
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              Committees
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Manage standing committees, leadership roles, and members for each
              term. Add one committee at a time using the form — everything you
              need is in a single dialog.
            </p>
          </div>
        </div>
        <Button
          onClick={openAddDialog}
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
            <div className="flex flex-wrap items-center gap-2">
              <Select value={yearTermFilter} onValueChange={setYearTermFilter}>
                <SelectTrigger className="h-9 w-[160px] rounded-full border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm">
                  <SelectValue placeholder="Year term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All year terms</SelectItem>
                  {yearTermOptions.map((term) => (
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
                    setYearTermFilter("all");
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
            Showing {filtered.length} of {committees.length} committees
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UsersRound className="mb-3 size-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                No committees found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {committees.length === 0
                  ? "Click Add Committee to create your first entry."
                  : "Try adjusting your search or year term filter."}
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
                  onEdit={() => openEditDialog(committee)}
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
              {editingCommittee ? "Edit Committee" : "Add Committee"}
            </DialogTitle>
            <DialogDescription>
              Enter the committee details below. Use the + button to add more
              members as needed.
            </DialogDescription>
          </DialogHeader>

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
              <div className="space-y-2">
                <Label htmlFor="year-term">
                  Year term <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.yearTerm}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, yearTerm: value }))
                  }
                >
                  <SelectTrigger id="year-term">
                    <SelectValue placeholder="Select year term" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMITTEE_YEAR_TERMS.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_TERM_VALUE}>
                      Other (type manually)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.yearTerm === CUSTOM_TERM_VALUE && (
                  <Input
                    placeholder="e.g. 2016-2019"
                    value={form.customYearTerm}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        customYearTerm: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                2. Leadership
              </p>
              <div className="space-y-2">
                <Label htmlFor="chairman">
                  Chairman <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="chairman"
                  placeholder="e.g. Hon. Francis Erick D. Delambaca"
                  value={form.chairman}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, chairman: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vice-chairman">
                  Vice-Chairman <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vice-chairman"
                  placeholder="e.g. Hon. Albert G. Bompat"
                  value={form.viceChairman}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      viceChairman: e.target.value,
                    }))
                  }
                />
              </div>
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
                Optional. Leave blank rows empty — they will be ignored when you
                save.
              </p>
              <div className="space-y-2">
                {form.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <GripVertical className="size-4 shrink-0 text-slate-300" />
                    <Input
                      placeholder={`Member ${index + 1} — e.g. Hon. Fabian A. Aranaydo`}
                      value={member}
                      onChange={(e) => updateMember(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (index === form.members.length - 1) {
                            addMemberRow();
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-slate-400 hover:text-rose-600"
                      onClick={() => removeMemberRow(index)}
                      disabled={form.members.length === 1}
                      aria-label="Remove member"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
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
              {editingCommittee ? "Save changes" : "Add committee"}
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
              {deleteTarget?.name} ({deleteTarget?.yearTerm}) will be removed.
              This action cannot be undone in this session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

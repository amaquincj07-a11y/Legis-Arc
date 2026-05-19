"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus,
  UserCircle,
  Upload,
  X,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { AdminSBMemberCard } from "@/components/admin/admin-sb-member-card";
import { mockSBMembers } from "@/lib/mock-data";
import {
  COMMITTEE_YEAR_TERMS,
  SB_MEMBER_POSITION_SLOTS,
} from "@/lib/constants";
import type { SBMember, SBMemberPositionSlot } from "@/lib/types";

const CUSTOM_TERM_VALUE = "__custom__";
const PLACEHOLDER_IMAGE = "/images/sb-member-placeholder.png";
const TOTAL_SLOTS = SB_MEMBER_POSITION_SLOTS.length;

type MemberFormState = {
  name: string;
  yearTerm: string;
  customYearTerm: string;
  positionSlot: SBMemberPositionSlot | "";
  imageUrl: string;
};

const emptyForm = (yearTerm: string): MemberFormState => ({
  name: "",
  yearTerm,
  customYearTerm: "",
  positionSlot: "",
  imageUrl: "",
});

function resolveYearTerm(form: MemberFormState): string {
  if (form.yearTerm === CUSTOM_TERM_VALUE) {
    return form.customYearTerm.trim();
  }
  return form.yearTerm;
}

function getSlotConfig(slot: SBMemberPositionSlot) {
  return SB_MEMBER_POSITION_SLOTS.find((s) => s.slot === slot)!;
}

function EmptySlotCard({
  label,
  cardPosition,
  className,
  onAdd,
}: {
  label: string;
  cardPosition: string;
  className?: string;
  onAdd: () => void;
}) {
  return (
    <Card
      className={`overflow-hidden border-5 border-dashed border-[#cbab53]/50 bg-slate-50/50 shadow-sm transition-shadow hover:border-[#cbab53] hover:shadow-md ${className ?? ""}`}
    >
      <CardContent className="flex h-full flex-col p-0">
        <div>
          <div className="relative flex aspect-3/4 w-full items-center justify-center bg-muted/30">
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <CircleDashed className="size-10 text-slate-300" />
              <p className="text-xs font-medium text-muted-foreground">
                Click to add photo
              </p>
            </div>
          </div>
          <div className="p-4 text-center sm:p-5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#3998eb]">
              {label}
            </p>
            <p className="text-sm font-medium text-slate-400">[name]</p>
            <p className="mt-0.5 text-sm font-medium text-[#3998eb]/60">
              {cardPosition}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/90 p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full gap-1.5 rounded-full text-xs"
            onClick={onAdd}
          >
            <Plus className="size-3.5" />
            Add member
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SBMembersPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [members, setMembers] = useState<SBMember[]>([...mockSBMembers]);
  const [selectedTerm, setSelectedTerm] = useState<string>(COMMITTEE_YEAR_TERMS[0]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<SBMember | null>(null);
  const [form, setForm] = useState<MemberFormState>(
    emptyForm(COMMITTEE_YEAR_TERMS[0])
  );
  const [deleteTarget, setDeleteTarget] = useState<SBMember | null>(null);

  const termOptions = useMemo(() => {
    const fromData = members.map((m) => m.yearTerm);
    return [...new Set([...COMMITTEE_YEAR_TERMS, ...fromData])].sort((a, b) =>
      b.localeCompare(a)
    );
  }, [members]);

  const termMembers = useMemo(
    () => members.filter((m) => m.yearTerm === selectedTerm),
    [members, selectedTerm]
  );

  const filledSlots = useMemo(
    () => new Set(termMembers.map((m) => m.positionSlot)),
    [termMembers]
  );

  const availableSlots = useMemo(
    () =>
      SB_MEMBER_POSITION_SLOTS.filter((s) => !filledSlots.has(s.slot)),
    [filledSlots]
  );

  const memberBySlot = useMemo(() => {
    const map = new Map<SBMemberPositionSlot, SBMember>();
    for (const m of termMembers) {
      map.set(m.positionSlot, m);
    }
    return map;
  }, [termMembers]);

  const viceMayorSlot = SB_MEMBER_POSITION_SLOTS.find(
    (s) => s.slot === "vice_mayor"
  )!;
  const otherSlots = SB_MEMBER_POSITION_SLOTS.filter(
    (s) => s.slot !== "vice_mayor"
  );

  function openAddDialog(slot: SBMemberPositionSlot) {
    setEditingMember(null);
    setForm({
      ...emptyForm(selectedTerm),
      positionSlot: slot,
    });
    setDialogOpen(true);
  }

  function openEditDialog(member: SBMember) {
    const isPreset = (COMMITTEE_YEAR_TERMS as readonly string[]).includes(
      member.yearTerm
    );
    setEditingMember(member);
    setForm({
      name: member.name,
      yearTerm: isPreset ? member.yearTerm : CUSTOM_TERM_VALUE,
      customYearTerm: isPreset ? "" : member.yearTerm,
      positionSlot: member.positionSlot,
      imageUrl: member.imageUrl ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingMember(null);
    setForm(emptyForm(selectedTerm));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageUrl: url }));
  }

  function handleSave() {
    const name = form.name.trim();
    const yearTerm = resolveYearTerm(form);
    const positionSlot = form.positionSlot;

    if (!name) {
      toast.error("Please enter the member's name");
      return;
    }
    if (!yearTerm) {
      toast.error("Please select or enter a year term");
      return;
    }
    if (!positionSlot) {
      toast.error("Please select a position");
      return;
    }

    const slotConfig = getSlotConfig(positionSlot);
    const duplicate = members.find(
      (m) =>
        m.yearTerm === yearTerm &&
        m.positionSlot === positionSlot &&
        m.id !== editingMember?.id
    );
    if (duplicate) {
      toast.error(
        `${slotConfig.label} is already assigned for ${yearTerm}. Edit or remove the existing entry first.`
      );
      return;
    }

    const payload: Omit<SBMember, "id" | "committees"> & {
      committees?: string[];
    } = {
      name,
      yearTerm,
      positionSlot,
      position: slotConfig.cardPosition,
      imageUrl: form.imageUrl || PLACEHOLDER_IMAGE,
      committees: editingMember?.committees ?? [],
    };

    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id ? { ...m, ...payload } : m
        )
      );
      toast.success("SB member updated");
      if (yearTerm !== selectedTerm) {
        setSelectedTerm(yearTerm);
      }
    } else {
      const newMember: SBMember = {
        id: `sb-${Date.now()}`,
        ...payload,
        committees: [],
      };
      setMembers((prev) => [...prev, newMember]);
      toast.success("SB member added");
      setSelectedTerm(yearTerm);
    }

    closeDialog();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    toast.success("SB member removed");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#3998eb]/10 text-[#3998eb]">
            <UserCircle className="size-5" />
          </div>
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              SB Members
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Build the Sangguniang Bayan roster by year term. Pick a term below,
              then click an open position to add a photo and name.
            </p>
        </div>
      </div>

      {/* Year term selector */}
      <Card className="border border-slate-200/90 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Select year term
              </p>
              <p className="text-xs text-muted-foreground">
                Members you add or view are grouped under this term.
              </p>
            </div>
            <Badge
              variant="secondary"
              className="w-fit gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              {termMembers.length === TOTAL_SLOTS ? (
                <CheckCircle2 className="size-3.5 text-emerald-600" />
              ) : (
                <CircleDashed className="size-3.5 text-amber-600" />
              )}
              {termMembers.length} / {TOTAL_SLOTS} positions filled
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {termOptions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSelectedTerm(term)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedTerm === term
                    ? "bg-[#3998eb] text-white shadow-md shadow-[#3998eb]/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roster — same card layout for every year term (matches 2025-2028) */}
      <div className="space-y-6">
        {termMembers.length < TOTAL_SLOTS && (
          <p className="text-sm text-muted-foreground">
            {termMembers.length === 0
              ? `No members added for ${selectedTerm} yet. Click any open slot below to get started.`
              : `${availableSlots.length} open slot${availableSlots.length !== 1 ? "s" : ""} remaining for ${selectedTerm}.`}
          </p>
        )}

        <div className="flex justify-center">
          {memberBySlot.get("vice_mayor") ? (
            <AdminSBMemberCard
              member={memberBySlot.get("vice_mayor")!}
              slotLabel={viceMayorSlot.label}
              className="w-full max-w-[220px] sm:max-w-[260px]"
              onEdit={() => openEditDialog(memberBySlot.get("vice_mayor")!)}
              onDelete={() =>
                setDeleteTarget(memberBySlot.get("vice_mayor")!)
              }
            />
          ) : (
            <EmptySlotCard
              label={viceMayorSlot.label}
              cardPosition={viceMayorSlot.cardPosition}
              className="w-full max-w-[220px] sm:max-w-[260px]"
              onAdd={() => openAddDialog("vice_mayor")}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {otherSlots.map((slot) => {
            const member = memberBySlot.get(slot.slot);
            if (member) {
              return (
                <AdminSBMemberCard
                  key={slot.slot}
                  member={member}
                  slotLabel={slot.label}
                  onEdit={() => openEditDialog(member)}
                  onDelete={() => setDeleteTarget(member)}
                />
              );
            }
            return (
              <EmptySlotCard
                key={slot.slot}
                label={slot.label}
                cardPosition={slot.cardPosition}
                onAdd={() => openAddDialog(slot.slot)}
              />
            );
          })}
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMember
                ? `Edit ${getSlotConfig(editingMember.positionSlot).label}`
                : form.positionSlot
                  ? `Add ${getSlotConfig(form.positionSlot).label}`
                  : "Add SB Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update the photo, name, or year term for this position."
                : "Enter the member's name and upload a photo for this position."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>
                Year term <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.yearTerm}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, yearTerm: value }))
                }
              >
                <SelectTrigger>
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

            {(editingMember || form.positionSlot) && (
              <div className="rounded-lg border border-[#3998eb]/20 bg-[#3998eb]/5 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Position
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {getSlotConfig(
                    (editingMember?.positionSlot ??
                      form.positionSlot) as SBMemberPositionSlot
                  ).label}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="member-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="member-name"
                placeholder="e.g. Francis Erick D. Delambaca"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Enter name without &quot;Hon.&quot; — it is added automatically on
                the card (except SB Secretary).
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Picture <span className="text-destructive">*</span>
              </Label>
              {form.imageUrl ? (
                <div className="relative mx-auto aspect-3/4 w-full max-w-[180px] overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={form.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover object-top"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 size-8 rounded-full"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, imageUrl: "" }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-[#3998eb]/40 hover:bg-muted/50"
                >
                  <Upload className="size-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload photo</span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG, or WebP — max 5MB
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {!form.imageUrl && (
                <p className="text-xs text-muted-foreground">
                  A placeholder image is used if you skip the upload.
                </p>
              )}
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
              {editingMember ? "Save changes" : "Add member"}
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
            <DialogTitle>Remove this member?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name} ({deleteTarget?.position},{" "}
              {deleteTarget?.yearTerm}) will be removed from the roster.
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

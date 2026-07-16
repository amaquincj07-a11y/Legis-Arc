"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SBMember } from "@/lib/types";

export function AdminSBMemberCard({
  member,
  slotLabel,
  className,
  onEdit,
  onDelete,
}: {
  member: SBMember;
  slotLabel?: string;
  className?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const showHon = member.position !== "SB Secretary";

  return (
    <Card
      className={`group relative overflow-hidden border-5 border-[#cbab53] shadow-sm transition-shadow hover:shadow-md ${className ?? ""}`}
    >
      <CardContent className="p-0">
        <div className="relative aspect-3/4 w-full bg-muted/30">
          <Image
            src={member.imageUrl ?? "/images/sb-member-placeholder.png"}
            alt={`Portrait of ${member.name}, ${member.position}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          />
        </div>
        <div className="p-4 text-center sm:p-5">
          {slotLabel && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#3998eb]">
              {slotLabel}
            </p>
          )}
          <h3 className="font-semibold text-slate-900">
            {showHon ? "Hon. " : ""}
            {member.name}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-[#3998eb]">
            {member.position}
          </p>
        </div>
        <div className="flex gap-2 border-t border-slate-100 bg-slate-50/90 p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 flex-1 gap-1.5 rounded-full text-xs"
            onClick={onEdit}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 flex-1 gap-1.5 rounded-full text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

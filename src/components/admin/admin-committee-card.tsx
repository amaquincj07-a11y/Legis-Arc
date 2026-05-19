"use client";

import { Pencil, Trash2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Committee } from "@/lib/types";

export function AdminCommitteeCard({
  committee,
  onEdit,
  onDelete,
}: {
  committee: Committee;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-t-4 border-[#3998eb] shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug text-slate-900">
            {committee.name}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0 rounded-full bg-[#3998eb]/10 text-[10px] font-medium text-[#3998eb] hover:bg-[#3998eb]/10"
          >
            {committee.yearTerm}
          </Badge>
        </div>

        <div className="mt-3 flex-1 space-y-2 text-sm text-slate-600">
          <div className="flex gap-2">
            <span className="shrink-0 font-semibold text-slate-800">
              Chairman:
            </span>
            <span>{committee.chairman}</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 font-semibold text-slate-800">
              Vice Chairman:
            </span>
            <span>{committee.viceChairman}</span>
          </div>
          <div className="pt-1">
            <p className="font-semibold text-slate-800">Members</p>
            {committee.members.length > 0 ? (
              <ul className="mt-1.5 space-y-1.5">
                {committee.members.map((member, index) => (
                  <li
                    key={`${committee.id}-member-${index}`}
                    className="flex items-start gap-2 text-xs text-slate-600"
                  >
                    <User className="mt-0.5 size-3 shrink-0 text-[#3998eb]" />
                    <span>{member}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">No members listed</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
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

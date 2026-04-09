"use client";

import Image from "next/image";
import { useState } from "react";
import { Building, Star, Award, Users, ChevronRight, MapPinned } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { SBMember, Committee } from "@/lib/types";

function getMemberCommitteeRoles(
  member: SBMember,
  committees: Committee[]
) {
  const formattedName =
    member.position === "Vice Mayor"
      ? `Vice Mayor ${member.name}`
      : `Hon. ${member.name}`;

  const roles: { committee: string; role: "Chairman" | "Vice Chairman" | "Member" }[] = [];

  for (const c of committees) {
    if (c.name === "Committee of the Whole / En Banc") continue;
    if (c.chairman === formattedName) {
      roles.push({ committee: c.name, role: "Chairman" });
    } else if (c.viceChairman === formattedName) {
      roles.push({ committee: c.name, role: "Vice Chairman" });
    } else if (c.members.includes(formattedName)) {
      roles.push({ committee: c.name, role: "Member" });
    }
  }

  // Sort: Chairman first, then Vice Chairman, then Member
  const order = { Chairman: 0, "Vice Chairman": 1, Member: 2 };
  roles.sort((a, b) => order[a.role] - order[b.role]);

  return roles;
}

const roleBadgeStyles = {
  Chairman: "bg-[#cbab53]/15 text-[#9a7f2e] border-[#cbab53]/30",
  "Vice Chairman": "bg-[#3998eb]/10 text-[#2a7fd4] border-[#3998eb]/30",
  Member: "bg-muted text-muted-foreground border-border",
} as const;

const roleIcons = {
  Chairman: Star,
  "Vice Chairman": Award,
  Member: Users,
} as const;

export function SBMemberCard({
  member,
  committees,
  districtAssignment,
  className,
}: {
  member: SBMember;
  committees: Committee[];
  districtAssignment?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const roles = getMemberCommitteeRoles(member, committees);

  return (
    <>
      <Card
        className={`group border-5 border-[#cbab53] transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${className ?? ""}`}
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-0">
          <div className="relative aspect-3/4 w-full bg-muted/30">
            <Image
              src={member.imageUrl ?? "/images/sb-member-placeholder.png"}
              alt={`Portrait of ${member.name}, ${member.position}`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          <div className="p-5 text-center">
            <h3 className="font-[family-name:var(--font-garamond)] font-semibold text-black hover:text-[#cbab53]">
              {member.position === "SB Secretary" ? "" : "Hon. "}{member.name}
            </h3>
            <p className="font-[family-name:var(--font-garamond)] mt-0.5 text-sm text-[#3998eb] font-medium hover:text-[#cbab53]">
              {member.position}
            </p>
            {roles.length > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-[#25395C]/8 px-2.5 py-1 w-fit mx-auto group-hover:bg-[#25395C]/12 transition-colors">
                <Building className="h-3 w-3 text-[#25395C]/60" />
                <span className="font-[family-name:var(--font-garamond)] text-xs font-medium text-[#25395C]/70">
                  {roles.length} Committee{roles.length !== 1 ? "s" : ""}
                </span>
                <ChevronRight className="h-2.5 w-2.5 text-[#25395C]/40" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] p-0 gap-0 overflow-hidden">
          {/* Header with photo and name */}
          <div className="bg-[#25395C] p-5 sm:p-6">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#cbab53] sm:h-20 sm:w-20">
                  <Image
                    src={member.imageUrl ?? "/images/sb-member-placeholder.png"}
                    alt={member.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div>
                  <DialogTitle className="font-[family-name:var(--font-garamond)] text-white text-lg sm:text-xl">
                    {member.position === "SB Secretary" ? "" : "Hon. "}{member.name}
                  </DialogTitle>
                  <p className="font-[family-name:var(--font-garamond)] mt-1 text-sm text-[#cbab53] font-medium sm:text-base">
                    {member.position}
                  </p>
                  <p className="font-[family-name:var(--font-garamond)] mt-0.5 text-xs text-white/50">
                    {roles.length} Committee Assignment{roles.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Committee list & District Assignment */}
          <ScrollArea className="max-h-[55vh]">
            <div className="p-4 sm:p-5 space-y-2">
              {districtAssignment && (
                <div className="flex items-center gap-3 rounded-lg border border-[#cbab53]/30 bg-[#cbab53]/5 p-3 mb-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#cbab53]/15">
                    <MapPinned className="h-3.5 w-3.5 text-[#9a7f2e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-garamond)] text-xs font-medium text-muted-foreground uppercase tracking-wider">District Assignment</p>
                    <p className="font-[family-name:var(--font-garamond)] text-base font-semibold text-foreground">{districtAssignment}</p>
                  </div>
                </div>
              )}
              {roles.length === 0 && !districtAssignment ? (
                <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground text-center py-6">
                  No committee assignments found.
                </p>
              ) : (
                roles.map((r) => {
                  const RoleIcon = roleIcons[r.role];
                  return (
                    <div
                      key={r.committee}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#25395C]/10">
                        <RoleIcon className="h-3.5 w-3.5 text-[#25395C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-[family-name:var(--font-garamond)] text-base font-medium text-foreground leading-snug">
                          {r.committee}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-1.5 text-xs px-2 py-0 h-5 font-[family-name:var(--font-garamond)] ${roleBadgeStyles[r.role]}`}
                        >
                          {r.role}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

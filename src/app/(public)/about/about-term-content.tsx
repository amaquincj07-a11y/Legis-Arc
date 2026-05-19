"use client";

import { useState } from "react";
import Image from "next/image";
import { User, UserCircle, MapPinned } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockSBMembers, mockSBStaff, mockCommittees } from "@/lib/mock-data";
import { SB_MEMBER_POSITION_SLOTS } from "@/lib/constants";
import type { SBMember } from "@/lib/types";
import { SBMemberCard } from "@/components/public/sb-member-card";

const TERMS = ["2025-2028", "2023-2025", "2019-2022"] as const;
type Term = (typeof TERMS)[number];

const districtMap: Record<string, string> = {
  "Renel Ryan B. Mila": "Brgy. Bil-isan",
  "Fabian A. Aranaydo": "Brgy. Bolod",
  "Zinon G. Labaya": "Brgy. Danao",
  "Felix M. Fudolig": "Brgy. Doljo",
  "Amira Alia M. Caindec": "Brgy. Libaong",
  "Eduard G. Mejos": "Brgy. Looc",
  "Analyn H. Casane": "Brgy. Lourdes",
  "Francis Erick D. Delambaca": "Brgy. Poblacion",
  "Alfonso C. Alcala": "Brgy. Tangan",
  "Albert G. Bompat": "Brgy. Tawala",
};

const districtAssignments = [
  { barangay: "Brgy. Bil-isan", member: "Hon. Renel Ryan B. Mila" },
  { barangay: "Brgy. Looc", member: "Hon. Eduard G. Mejos" },
  { barangay: "Brgy. Bolod", member: "Hon. Fabian A. Aranaydo" },
  { barangay: "Brgy. Lourdes", member: "Hon. Analyn H. Casane" },
  { barangay: "Brgy. Danao", member: "Hon. Zinon G. Labaya" },
  { barangay: "Brgy. Poblacion", member: "Hon. Francis Erick D. Delambaca" },
  { barangay: "Brgy. Doljo", member: "Hon. Felix M. Fudolig" },
  { barangay: "Brgy. Tangan", member: "Hon. Alfonso C. Alcala" },
  { barangay: "Brgy. Libaong", member: "Hon. Amira Alia M. Caindec" },
  { barangay: "Brgy. Tawala", member: "Hon. Albert G. Bompat" },
];

// Placeholder positions for past terms (mirrors current term structure)
const placeholderSBPositions = [
  { id: "ph-1", position: "Vice Mayor" },
  { id: "ph-2", position: "SB Member" },
  { id: "ph-3", position: "SB Member" },
  { id: "ph-4", position: "SB Member" },
  { id: "ph-5", position: "SB Member" },
  { id: "ph-6", position: "SB Member" },
  { id: "ph-7", position: "SB Member" },
  { id: "ph-8", position: "SB Member" },
  { id: "ph-9", position: "SB Member" },
  { id: "ph-10", position: "ABC President" },
  { id: "ph-11", position: "SK Federation President" },
  { id: "ph-12", position: "SB Secretary" },
];

function PlaceholderMemberCard({ position, className }: { position: string; className?: string }) {
  const showHon = position !== "SB Secretary";
  return (
    <Card className={`border-5 border-[#cbab53]/40 ${className ?? ""}`}>
      <CardContent className="p-0">
        <div className="relative aspect-3/4 w-full bg-[#25395C]/20 flex items-center justify-center">
          <UserCircle className="h-16 w-16 text-white/15 sm:h-20 sm:w-20" />
        </div>
        <div className="p-5">
          <h3 className="font-[family-name:var(--font-garamond)] font-semibold text-white/40">
            {showHon ? "Hon. " : ""}[name]
          </h3>
          <p className="font-[family-name:var(--font-garamond)] mt-0.5 text-sm text-[#3998eb]/60 font-medium">
            {position}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderStaffCard() {
  return (
    <Card className="border-3 border-white/10 bg-white/5 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="relative aspect-3/4 w-full bg-[#25395C]/50 flex items-center justify-center">
          <UserCircle className="h-16 w-16 text-white/15 sm:h-20 sm:w-20" />
        </div>
        <div className="p-4">
          <h3 className="font-[family-name:var(--font-garamond)] text-base font-semibold text-white/40">[name]</h3>
          <p className="font-[family-name:var(--font-garamond)] mt-0.5 text-sm text-[#3998eb]/60 font-medium">SB Staff</p>
        </div>
      </CardContent>
    </Card>
  );
}

function sortMembersBySlot(members: SBMember[]) {
  return [...members].sort((a, b) => {
    const orderA =
      SB_MEMBER_POSITION_SLOTS.find((s) => s.slot === a.positionSlot)?.order ??
      99;
    const orderB =
      SB_MEMBER_POSITION_SLOTS.find((s) => s.slot === b.positionSlot)?.order ??
      99;
    return orderA - orderB;
  });
}

export function AboutTermContent() {
  const [selectedTerm, setSelectedTerm] = useState<Term>("2025-2028");
  const termMembers = sortMembersBySlot(
    mockSBMembers.filter((m) => m.yearTerm === selectedTerm)
  );
  const hasTermMembers = termMembers.length > 0;
  const isCurrentTerm = selectedTerm === "2025-2028";

  return (
    <>
      {/* Term Selector */}
      <section className="bg-[#25395C] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 py-3 sm:gap-2 sm:py-4">
            {TERMS.map((term) => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`font-[family-name:var(--font-garamond)] rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 sm:px-6 sm:text-base ${
                  selectedTerm === term
                    ? "bg-[#cbab53] text-[#1e3148] shadow-lg"
                    : "bg-white/8 text-white/60 hover:bg-white/15 hover:text-white/80"
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SB Member Chart */}
      <section className="bg-[#25395C] py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hasTermMembers ? (
            (() => {
              const viceMayor = termMembers.find(
                (m) => m.positionSlot === "vice_mayor"
              );
              const otherMembers = termMembers.filter(
                (m) => m.positionSlot !== "vice_mayor"
              );

              return (
                <>
                  {viceMayor && (
                    <div className="mb-6 flex justify-center sm:mb-8">
                      <SBMemberCard
                        member={viceMayor}
                        committees={mockCommittees}
                        districtAssignment={districtMap[viceMayor.name]}
                        className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)]"
                      />
                    </div>
                  )}

                  <div className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {otherMembers.map((member) => (
                      <SBMemberCard
                        key={member.id}
                        member={member}
                        committees={mockCommittees}
                        districtAssignment={districtMap[member.name]}
                      />
                    ))}
                  </div>
                </>
              );
            })()
          ) : (
            (() => {
              const vicePos = placeholderSBPositions.find((p) => p.position === "Vice Mayor")!;
              const otherPos = placeholderSBPositions.filter((p) => p.position !== "Vice Mayor");
              return (
                <>
                  <div className="mb-6 flex justify-center sm:mb-8">
                    <PlaceholderMemberCard
                      position={vicePos.position}
                      className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)]"
                    />
                  </div>
                  <div className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {otherPos.map((p) => (
                      <PlaceholderMemberCard key={p.id} position={p.position} />
                    ))}
                  </div>
                </>
              );
            })()
          )}
        </div>
      </section>

      {/* SB Staff Section */}
      <section className="bg-[#1e3148] py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-center">
            <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
              SB Staff
            </h2>
          </div>

          {isCurrentTerm ? (
            <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {mockSBStaff.map((staff) => (
                <Card key={staff.id} className="group border-3 border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:border-[#cbab53]/50 hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="relative aspect-3/4 w-full bg-[#25395C]/50 flex items-center justify-center">
                      {staff.imageUrl ? (
                        <Image
                          src={staff.imageUrl}
                          alt={`Portrait of ${staff.name}`}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <UserCircle className="h-16 w-16 text-white/20 sm:h-20 sm:w-20" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-[family-name:var(--font-garamond)] text-base font-semibold text-white/90">
                        {staff.name}
                      </h3>
                      <p className="font-[family-name:var(--font-garamond)] mt-0.5 text-sm text-[#3998eb] font-medium">
                        {staff.position}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <PlaceholderStaffCard key={`ph-staff-${i}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Separator />
      </div>

      {/* Committees */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
              <h2 className="font-[family-name:var(--font-garamond)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Committees
              </h2>
              <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground mt-1">
                Standing committees of the Sangguniang Bayan
              </p>
          </div>

          {isCurrentTerm ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {mockCommittees.filter((c) => c.name !== "Committee of the Whole / En Banc").map((committee) => (
                <Card key={committee.id} className="border-t-4 border-[#3998eb] hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 sm:p-5">
                    <h3 className="font-[family-name:var(--font-garamond)] font-semibold text-foreground text-base">
                      {committee.name}
                    </h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground font-[family-name:var(--font-garamond)]">
                      <div className="flex gap-2">
                        <span className="font-semibold text-foreground">Chairman:</span>
                        <span>{committee.chairman}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-foreground">Vice Chairman:</span>
                        <span>{committee.viceChairman}</span>
                      </div>
                      <div className="pt-1">
                        <p className="font-semibold text-foreground">Members</p>
                        <div className="mt-1 space-y-1.5">
                          {committee.members.map((member) => (
                            <div
                              key={member}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <User className="h-3 w-3 shrink-0" />
                              <span>{member}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {mockCommittees.filter((c) => c.name !== "Committee of the Whole / En Banc").map((committee) => (
                <Card key={committee.id} className="border-t-4 border-[#3998eb]/30">
                  <CardContent className="p-4 sm:p-5">
                    <h3 className="font-semibold text-foreground text-sm">
                      {committee.name}
                    </h3>
                    <div className="mt-3 space-y-2 text-xs text-muted-foreground/50">
                      <div className="flex gap-2">
                        <span className="font-semibold text-foreground/50">Chairman:</span>
                        <span>[name]</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-foreground/50">Vice Chairman:</span>
                        <span>[name]</span>
                      </div>
                      <div className="pt-1">
                        <p className="font-semibold text-foreground/50">Members</p>
                        <div className="mt-1 space-y-1.5">
                          {committee.members.map((_, idx) => (
                            <div
                              key={idx}
                            className="flex items-center gap-2 text-sm text-muted-foreground/40 font-[family-name:var(--font-garamond)]"
                            >
                              <User className="h-3 w-3 shrink-0" />
                              <span>[name]</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* District Assignments */}
      <section className="bg-muted/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
              <MapPinned className="h-5 w-5 text-navy" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-garamond)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                District Assignments
              </h2>
              <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
                Barangay assignments of SB Members
              </p>
            </div>
          </div>

          {isCurrentTerm ? (
            <Card className="border hover:shadow-sm transition-shadow">
              <CardContent className="p-5 sm:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-3">
                  {districtAssignments.map((item) => (
                    <div key={item.barangay} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                      <span className="font-[family-name:var(--font-garamond)] text-base font-semibold text-foreground">{item.barangay}</span>
                      <span className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">{item.member}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border">
              <CardContent className="p-5 sm:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-3">
                  {districtAssignments.map((item) => (
                    <div key={item.barangay} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                      <span className="font-[family-name:var(--font-garamond)] text-base font-semibold text-foreground">{item.barangay}</span>
                      <span className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground/40">Hon. [name]</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}

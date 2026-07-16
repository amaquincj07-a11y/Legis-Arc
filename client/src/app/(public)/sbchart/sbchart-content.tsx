"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, User, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  COMMITTEE_YEAR_TERMS,
  SB_MEMBER_POSITION_SLOTS,
} from "@/lib/constants";
import { fetchPublicSBChartAction } from "@/lib/public-sb-chart-actions";
import { usePlaceFilter } from "@/lib/place-filter-context";
import type { Committee, SBMember, SBMemberPositionSlot } from "@/lib/types";
import { SBMemberCard } from "@/components/public/sb-member-card";

const TERMS = COMMITTEE_YEAR_TERMS;
type Term = (typeof TERMS)[number];
const CURRENT_TERM = TERMS[0];

function PlaceholderMemberCard({
  position,
  className,
}: {
  position: string;
  className?: string;
}) {
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

function PlaceholderCommitteeCard({ name }: { name: string }) {
  return (
    <Card className="border-t-4 border-[#3998eb]/30">
      <CardContent className="p-4 sm:p-5">
        <h3 className="font-semibold text-foreground text-sm">{name}</h3>
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground/40 font-[family-name:var(--font-garamond)]">
                <User className="h-3 w-3 shrink-0" />
                <span>[name]</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SBChartContent() {
  const { province, municipality, municipalityName, provinceName } =
    usePlaceFilter();
  const [selectedTerm, setSelectedTerm] = useState<Term>(CURRENT_TERM);
  const [sbMembers, setSbMembers] = useState<SBMember[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isCurrentTerm = selectedTerm === CURRENT_TERM;

  const loadChartData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const result = await fetchPublicSBChartAction(province, municipality);

    if (result.success) {
      setSbMembers(result.data.sbMembers);
      setCommittees(result.data.committees);
    } else {
      setSbMembers([]);
      setCommittees([]);
      setLoadError(result.error);
    }

    setLoading(false);
  }, [province, municipality]);

  useEffect(() => {
    void loadChartData();
  }, [loadChartData]);

  useEffect(() => {
    setSelectedTerm(CURRENT_TERM);
  }, [province, municipality]);

  const memberBySlot = useMemo(() => {
    const map = new Map<SBMemberPositionSlot, SBMember>();
    for (const member of sbMembers) {
      if (member.name.trim()) {
        map.set(member.positionSlot, member);
      }
    }
    return map;
  }, [sbMembers]);

  const viceMayorSlot = SB_MEMBER_POSITION_SLOTS.find(
    (slot) => slot.slot === "vice_mayor"
  )!;
  const otherSlots = SB_MEMBER_POSITION_SLOTS.filter(
    (slot) => slot.slot !== "vice_mayor"
  );

  const visibleCommittees = committees.filter(
    (committee) => committee.name !== "Committee of the Whole / En Banc"
  );

  const hasRosterData = sbMembers.some((member) => member.name.trim());

  return (
    <>
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

      <section className="bg-[#25395C] py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/70">
              <Loader2 className="h-8 w-8 animate-spin text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-sm sm:text-base">
                Loading SB members for {municipalityName}, {provinceName}...
              </p>
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-red-300/30 bg-red-950/20 px-4 py-8 text-center text-red-100">
              <p className="font-[family-name:var(--font-garamond)] text-base">
                {loadError}
              </p>
            </div>
          ) : isCurrentTerm ? (
            <>
              {!hasRosterData && (
                <p className="mb-8 text-center font-[family-name:var(--font-garamond)] text-sm text-white/60 sm:text-base">
                  No SB members have been published for {municipalityName},{" "}
                  {provinceName} yet.
                </p>
              )}

              <div className="mb-6 flex justify-center sm:mb-8">
                {memberBySlot.get("vice_mayor") ? (
                  <SBMemberCard
                    member={memberBySlot.get("vice_mayor")!}
                    committees={committees}
                    className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)]"
                  />
                ) : (
                  <PlaceholderMemberCard
                    position={viceMayorSlot.cardPosition}
                    className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)]"
                  />
                )}
              </div>

              <div className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {otherSlots.map((slot) => {
                  const member = memberBySlot.get(slot.slot);
                  return member ? (
                    <SBMemberCard
                      key={slot.slot}
                      member={member}
                      committees={committees}
                    />
                  ) : (
                    <PlaceholderMemberCard
                      key={slot.slot}
                      position={slot.cardPosition}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 flex justify-center sm:mb-8">
                <PlaceholderMemberCard
                  position={viceMayorSlot.cardPosition}
                  className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)]"
                />
              </div>
              <div className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {otherSlots.map((slot) => (
                  <PlaceholderMemberCard
                    key={slot.slot}
                    position={slot.cardPosition}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Separator />
      </div>

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

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-[#3998eb]" />
              <p className="font-[family-name:var(--font-garamond)] text-sm">
                Loading committees for {municipalityName}, {provinceName}...
              </p>
            </div>
          ) : loadError ? (
            <p className="text-center font-[family-name:var(--font-garamond)] text-muted-foreground">
              {loadError}
            </p>
          ) : isCurrentTerm ? (
            visibleCommittees.length > 0 ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {visibleCommittees.map((committee) => (
                  <Card
                    key={committee.id}
                    className="border-t-4 border-[#3998eb] hover:shadow-sm transition-shadow"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <h3 className="font-[family-name:var(--font-garamond)] font-semibold text-foreground text-base">
                        {committee.name}
                      </h3>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground font-[family-name:var(--font-garamond)]">
                        <div className="flex gap-2">
                          <span className="font-semibold text-foreground">
                            Chairman:
                          </span>
                          <span>{committee.chairman}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-semibold text-foreground">
                            Vice Chairman:
                          </span>
                          <span>{committee.viceChairman}</span>
                        </div>
                        <div className="pt-1">
                          <p className="font-semibold text-foreground">Members</p>
                          <div className="mt-1 space-y-1.5">
                            {committee.members.length > 0 ? (
                              committee.members.map((member) => (
                                <div
                                  key={member}
                                  className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                  <User className="h-3 w-3 shrink-0" />
                                  <span>{member}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                No members assigned
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center font-[family-name:var(--font-garamond)] text-muted-foreground">
                No committees have been published for {municipalityName},{" "}
                {provinceName} yet.
              </p>
            )
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {visibleCommittees.length > 0
                ? visibleCommittees.map((committee) => (
                    <PlaceholderCommitteeCard
                      key={committee.id}
                      name={committee.name}
                    />
                  ))
                : (
                    <PlaceholderCommitteeCard name="Committee" />
                  )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

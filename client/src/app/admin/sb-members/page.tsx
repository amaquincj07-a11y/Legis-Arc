"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SBMembersTab } from "@/components/admin/sb-members-tab";
import { CommitteesTab } from "@/components/admin/committees-tab";
import { DistrictAssignmentsTab } from "@/components/admin/district-assignments-tab";

type SBMembersTabValue = "members" | "committees" | "districts";

function getTabValue(tab: string | null): SBMembersTabValue {
  if (tab === "committees") return "committees";
  if (tab === "districts") return "districts";
  return "members";
}

function tabHref(tab: SBMembersTabValue): string {
  if (tab === "committees") return "/admin/sb-members?tab=committees";
  if (tab === "districts") return "/admin/sb-members?tab=districts";
  return "/admin/sb-members";
}

export default function SBMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = getTabValue(searchParams.get("tab"));

  const handleTabChange = useCallback(
    (value: string) => {
      router.replace(tabHref(getTabValue(value)));
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#3998eb]/10 text-[#3998eb]">
          <UserCircle className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-[26px]">
            SB Members
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage the Sangguniang Bayan roster, standing committees, and
            barangay district assignments in one place.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-10 rounded-full bg-slate-100 p-1">
          <TabsTrigger
            value="members"
            className="rounded-full px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            SB Members
          </TabsTrigger>
          <TabsTrigger
            value="committees"
            className="rounded-full px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Committees
          </TabsTrigger>
          <TabsTrigger
            value="districts"
            className="rounded-full px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            District Assignment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <SBMembersTab />
        </TabsContent>
        <TabsContent value="committees" className="mt-6">
          <CommitteesTab />
        </TabsContent>
        <TabsContent value="districts" className="mt-6">
          <DistrictAssignmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

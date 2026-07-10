"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SBMembersTab } from "@/components/admin/sb-members-tab";
import { CommitteesTab } from "@/components/admin/committees-tab";

type SBMembersTabValue = "members" | "committees";

function getTabValue(tab: string | null): SBMembersTabValue {
  return tab === "committees" ? "committees" : "members";
}

export default function SBMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = getTabValue(searchParams.get("tab"));

  const handleTabChange = useCallback(
    (value: string) => {
      const nextTab = getTabValue(value);
      router.replace(
        nextTab === "committees"
          ? "/admin/sb-members?tab=committees"
          : "/admin/sb-members"
      );
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
            Manage the Sangguniang Bayan roster and standing committees in one
            place.
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
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <SBMembersTab />
        </TabsContent>
        <TabsContent value="committees" className="mt-6">
          <CommitteesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

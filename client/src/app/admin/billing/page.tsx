"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BillingOverview } from "@/components/admin/billing/billing-overview";
import { BillingHistory } from "@/components/admin/billing/billing-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BILLING_TABS = [
  { value: "overview", label: "Overview" },
  { value: "history", label: "Billing History" },
] as const;

type BillingTab = (typeof BILLING_TABS)[number]["value"];

function isBillingTab(value: string | null): value is BillingTab {
  return BILLING_TABS.some((tab) => tab.value === value);
}

function BillingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: BillingTab = isBillingTab(tabParam) ? tabParam : "overview";

  const handleTabChange = useCallback(
    (value: string) => {
      router.replace(`/admin/billing?tab=${value}`, { scroll: false });
    },
    [router]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Billing"
        description="View your subscription status, payment records, and renewal dates"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList variant="line" className="w-full justify-start">
          {BILLING_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <BillingOverview />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <BillingHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl p-6 text-sm text-muted-foreground">Loading billing…</div>}>
      <BillingPageContent />
    </Suspense>
  );
}

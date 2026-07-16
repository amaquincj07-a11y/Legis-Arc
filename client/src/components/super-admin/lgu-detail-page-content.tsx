"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchLGUClientByIdAction } from "@/lib/super-admin-actions";
import { useSuperAdminLGUs } from "@/lib/super-admin-lgu-context";
import type { LGUClient } from "@/lib/types";
import { LGUProfileTab } from "@/components/super-admin/lgu-profile-tab";
import { LGUSubscriptionTab } from "@/components/super-admin/lgu-subscription-tab";
import { LGUUsersTab } from "@/components/super-admin/lgu-users-tab";
import { LGUStatusBadge } from "@/components/super-admin/lgu-status-badge";
import { getEffectiveLGUStatus, SUBSCRIPTION_PLAN_LABEL } from "@/lib/lgu-subscription";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type LGUDetailPageContentProps = {
  id: string;
};

export function LGUDetailPageContent({ id }: LGUDetailPageContentProps) {
  const { syncClient } = useSuperAdminLGUs();
  const [client, setClient] = useState<LGUClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadClient() {
      setIsLoading(true);
      setError(null);

      const result = await fetchLGUClientByIdAction(id);

      if (cancelled) return;

      if (!result.success) {
        setClient(null);
        setError(result.error);
      } else {
        setClient(result.data);
        syncClient(result.data);
      }

      setIsLoading(false);
    }

    void loadClient();

    return () => {
      cancelled = true;
    };
  }, [id, syncClient]);

  function handleUpdate(updated: LGUClient) {
    setClient(updated);
    syncClient(updated);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 gap-1.5 text-muted-foreground"
        >
          <Link href="/super-admin/lgus">
            <ArrowLeft className="size-4" />
            Back to LGUs
          </Link>
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
          <p className="font-medium text-red-900">Unable to load LGU account</p>
          <p className="mt-1 text-sm text-red-700">
            {error ?? "This LGU could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 gap-1.5 text-muted-foreground"
          >
            <Link href="/super-admin/lgus">
              <ArrowLeft className="size-4" />
              Back to LGUs
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-[26px]">
              {client.municipality}
            </h1>
            <LGUStatusBadge status={getEffectiveLGUStatus(client)} />
          </div>
          <p className="text-sm text-muted-foreground">
            {client.province} · {client.documentCount.toLocaleString("en-PH")}{" "}
            documents
            {client.supportPlan
              ? ` · ${SUBSCRIPTION_PLAN_LABEL} plan`
              : ""}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="users">LGU Users</TabsTrigger>
          <TabsTrigger value="subscription">Subscription Details</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <LGUProfileTab client={client} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="users">
          <LGUUsersTab client={client} />
        </TabsContent>

        <TabsContent value="subscription">
          <LGUSubscriptionTab client={client} onUpdate={handleUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

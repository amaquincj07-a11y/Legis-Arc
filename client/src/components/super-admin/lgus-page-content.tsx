"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateLGUAccountButton } from "@/components/super-admin/create-lgu-account-dialog";
import { LGUTable } from "@/components/super-admin/lgu-table";
import { useSuperAdminLGUs } from "@/lib/super-admin-lgu-context";

export function LGUsPageContent() {
  const { clients, isLoading, error } = useSuperAdminLGUs();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="LGUs"
        description="Manage client municipalities and cities"
      >
        <CreateLGUAccountButton />
      </AdminPageHeader>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        {isLoading
          ? "Loading LGU accounts..."
          : `${clients.length} LGU${clients.length !== 1 ? "s" : ""} registered on the platform`}
      </p>

      <LGUTable />
    </div>
  );
}

"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DashboardStats } from "@/components/super-admin/dashboard-stats";

export function SuperAdminDashboardContent() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of all LGU clients across the platform"
      />

      <DashboardStats />
    </div>
  );
}

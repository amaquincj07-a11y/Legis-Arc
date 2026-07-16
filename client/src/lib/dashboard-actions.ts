"use server";

import { apiGetAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type DashboardStats = {
  ordinanceCount: number;
  resolutionCount: number;
  minutesCount: number;
  totalDocuments: number;
  categoryBreakdown: { name: string; count: number }[];
};

export async function fetchDashboardStatsAction(): Promise<
  ActionResult<DashboardStats>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const data = await apiGetAuth<DashboardStats>(
      "/api/admin/dashboard/stats",
      token
    );
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load dashboard stats.",
    };
  }
}

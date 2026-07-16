"use server";

import { apiGetAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import {
  mapActivityLogRowToEntry,
  type ActivityLogRow,
} from "@/lib/mappers/activity-log-mapper";
import type { AuditLogEntry } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchLGUActivityLogsAction(): Promise<
  ActionResult<AuditLogEntry[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<ActivityLogRow[]>(
      "/api/admin/activity-logs",
      token
    );
    return {
      success: true,
      data: rows.map(mapActivityLogRowToEntry),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load activity logs.",
    };
  }
}

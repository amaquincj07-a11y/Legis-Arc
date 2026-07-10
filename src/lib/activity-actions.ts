"use server";

import {
  ACTIVITY_LOG_SELECT,
  mapActivityLogRowToEntry,
  type ActivityLogRow,
} from "@/lib/supabase/activity-log-mapper";
import { requireLGUSession } from "@/lib/supabase/require-lgu-user";
import type { AuditLogEntry } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function fetchLGUActivityLogsAction(): Promise<
  ActionResult<AuditLogEntry[]>
> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const { data, error: queryError } = await session.supabase
      .from("lgu_activity_logs")
      .select(ACTIVITY_LOG_SELECT)
      .eq("lgu_id", session.lguId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (queryError) {
      return { success: false, error: queryError.message };
    }

    const logs = ((data ?? []) as ActivityLogRow[]).map(mapActivityLogRowToEntry);
    return { success: true, data: logs };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to load recent activity."),
    };
  }
}

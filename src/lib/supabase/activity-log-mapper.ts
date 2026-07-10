import type { AuditLogEntry } from "@/lib/types";

export const ACTIVITY_LOG_SELECT =
  "id, lgu_id, user_id, user_name, action, module, entity_id, entity_title, details, created_at";

export type ActivityLogRow = {
  id: string;
  lgu_id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  module: string;
  entity_id: string | null;
  entity_title: string | null;
  details: string;
  created_at: string;
};

export function mapActivityLogRowToEntry(row: ActivityLogRow): AuditLogEntry {
  return {
    id: row.id,
    timestamp: new Date(row.created_at),
    userId: row.user_id ?? "",
    userName: row.user_name,
    action: row.action,
    documentId: row.entity_id ?? undefined,
    documentTitle: row.entity_title ?? undefined,
    details: row.details,
  };
}

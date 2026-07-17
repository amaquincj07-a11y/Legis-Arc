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
  details: unknown;
  created_at: string;
};

function coerceDetails(details: unknown): string {
  if (typeof details === "string") return details;
  if (details == null) return "";
  if (typeof details === "object" && details !== null && "message" in details) {
    const message = (details as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

export function mapActivityLogRowToEntry(row: ActivityLogRow): AuditLogEntry {
  return {
    id: row.id,
    timestamp: new Date(row.created_at),
    userId: row.user_id ?? "",
    userName: row.user_name,
    action: row.action,
    module: row.module,
    documentId: row.entity_id ?? undefined,
    documentTitle: row.entity_title ?? undefined,
    details: coerceDetails(row.details),
  };
}

export function formatActivityModuleLabel(module: string): string {
  switch (module) {
    case "ordinances":
      return "Ordinance";
    case "resolutions":
      return "Resolution";
    case "minutes":
      return "Minutes";
    case "categories":
      return "Category";
    case "sb-members":
      return "SB Member";
    case "cso":
      return "CSO";
    case "committees":
      return "Committee";
    default:
      return module;
  }
}

/**
 * Shared enums / unions — mirrors Postgres enums + client `types.ts`.
 */

export type AccountType = "company" | "lgu";
export type UserRole = "sb_secretary" | "sb_member" | "digitization_assistant";
export type DocumentStatus = "draft" | "validated" | "published" | "archived";
export type SessionType = "regular" | "special";
export type OrdinanceKind = "regular" | "revenue" | "expropriation";
export type LguStatus =
  | "active"
  | "paid"
  | "pending"
  | "suspended"
  | "expired";
export type ModuleAccess = "all" | "ordinances" | "resolutions" | "minutes";

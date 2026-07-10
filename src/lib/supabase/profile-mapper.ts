import type { User, UserRole } from "@/lib/types";

export const PROFILE_SELECT =
  "id, account_type, role, lgu_id, full_name, email, position, mobile, is_active, is_primary_admin, module_access, allowed_categories, managed_password, last_login_at, created_at";

export type ProfileRow = {
  id: string;
  account_type: "lgu" | "company";
  role: UserRole | null;
  lgu_id: string | null;
  full_name: string;
  email: string;
  position: string | null;
  mobile: string | null;
  is_active: boolean;
  is_primary_admin: boolean;
  module_access: string[] | null;
  allowed_categories: string[] | null;
  managed_password: string | null;
  last_login_at: string | null;
  created_at: string;
};

export function mapProfileRowToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    lguId: profile.lgu_id ?? undefined,
    position: profile.position ?? "",
    mobile: profile.mobile ?? "",
    role: profile.role ?? "sb_member",
    isActive: profile.is_active,
    isPrimaryAdmin: profile.is_primary_admin,
    managedPassword: profile.managed_password ?? undefined,
    lastLogin: profile.last_login_at
      ? new Date(profile.last_login_at)
      : new Date(profile.created_at),
    createdAt: new Date(profile.created_at),
    moduleAccess: (profile.module_access ?? []) as User["moduleAccess"],
    allowedCategories: profile.allowed_categories ?? [],
  };
}

import type { AccountType, UserRole, ModuleAccess } from "./enums.js";

export interface ProfileRow {
  id: string;
  account_type: AccountType;
  role: UserRole | null;
  lgu_id: string | null;
  full_name: string;
  email: string;
  position: string | null;
  mobile: string | null;
  is_active: boolean;
  is_primary_admin: boolean;
  module_access: ModuleAccess[] | null;
  allowed_categories: string[];
  managed_password: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  lguId?: string;
  position: string;
  mobile: string;
  role: UserRole;
  isActive: boolean;
  isPrimaryAdmin: boolean;
  moduleAccess: ModuleAccess[];
  allowedCategories: string[];
  lastLogin: string | null;
  createdAt: string;
}

export interface CompanyAdmin {
  id: string;
  name: string;
  email: string;
}

export const PROFILE_SELECT =
  "id, account_type, role, lgu_id, full_name, email, position, mobile, is_active, is_primary_admin, module_access, allowed_categories, managed_password, last_login_at, created_at";

export function mapProfileToAuthUser(profile: ProfileRow): AuthUser {
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
    moduleAccess: (profile.module_access ?? []) as ModuleAccess[],
    allowedCategories: profile.allowed_categories ?? [],
    lastLogin: profile.last_login_at,
    createdAt: profile.created_at,
  };
}

export function mapProfileToCompanyAdmin(profile: ProfileRow): CompanyAdmin {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
  };
}

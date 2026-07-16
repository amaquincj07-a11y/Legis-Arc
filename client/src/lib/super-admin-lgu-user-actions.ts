"use server";

import { revalidatePath } from "next/cache";
import { apiGetAuth, apiPostAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import {
  mapProfileRowToUser,
  type ProfileRow,
} from "@/lib/mappers/profile-mapper";
import type { ModuleKey, User, UserRole } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type UserApiRow = {
  id: string;
  email: string;
  full_name: string;
  position: string | null;
  role: UserRole | null;
  is_active: boolean;
  is_primary_admin: boolean;
  module_access?: string[] | null;
  managed_password?: string | null;
  last_login_at?: string | null;
  created_at?: string;
  mobile?: string | null;
  account_type?: "lgu" | "company";
  lgu_id?: string | null;
  allowed_categories?: string[] | null;
};

function mapUserRow(row: UserApiRow): User {
  return mapProfileRowToUser({
    id: row.id,
    account_type: row.account_type ?? "lgu",
    role: row.role,
    lgu_id: row.lgu_id ?? null,
    full_name: row.full_name,
    email: row.email,
    position: row.position,
    mobile: row.mobile ?? null,
    is_active: row.is_active,
    is_primary_admin: row.is_primary_admin,
    module_access: (row.module_access ?? []) as ModuleKey[],
    allowed_categories: row.allowed_categories ?? [],
    managed_password: row.managed_password ?? null,
    last_login_at: row.last_login_at ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
  } satisfies ProfileRow);
}

function formDataToUserBody(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    position: String(formData.get("position") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function fetchLGUUsersForCompanyAction(
  lguId: string
): Promise<ActionResult<User[]>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<UserApiRow[]>(
      `/api/company/lgus/${lguId}/users`,
      token
    );
    return {
      success: true,
      data: rows.map(mapUserRow),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load users.",
    };
  }
}

export async function createLGUUserForCompanyAction(
  lguId: string,
  formData: FormData
): Promise<ActionResult<User>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<UserApiRow>(
      `/api/company/lgus/${lguId}/users`,
      token,
      formDataToUserBody(formData)
    );
    revalidatePath(`/super-admin/lgus/${lguId}`);
    return { success: true, data: mapUserRow(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create user.",
    };
  }
}

export async function toggleLGUUserActiveForCompanyAction(
  lguId: string,
  userId: string,
  nextActive: boolean
): Promise<ActionResult<User>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<UserApiRow>(
      `/api/company/lgus/${lguId}/users/${userId}/toggle-active`,
      token,
      { isActive: nextActive }
    );
    revalidatePath(`/super-admin/lgus/${lguId}`);
    return { success: true, data: mapUserRow(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle user status.",
    };
  }
}

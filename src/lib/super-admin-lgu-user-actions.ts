"use server";

import { revalidatePath } from "next/cache";
import { LGU_STAFF_MODULE_ACCESS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mapProfileRowToUser,
  PROFILE_SELECT,
  type ProfileRow,
} from "@/lib/supabase/profile-mapper";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireCompanyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, error: "You must be signed in." as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    profile.account_type !== "company" ||
    !profile.is_active
  ) {
    return { supabase, error: "Company admin access required." as const };
  }

  return { supabase, error: null };
}

async function assertLGUExists(supabase: Awaited<ReturnType<typeof createClient>>, lguId: string) {
  const { data, error } = await supabase
    .from("lgus")
    .select("id")
    .eq("id", lguId)
    .maybeSingle();

  if (error || !data) {
    return { success: false as const, error: "LGU not found." };
  }

  return { success: true as const };
}

function safeRevalidate(lguId: string) {
  try {
    revalidatePath(`/super-admin/lgus/${lguId}`);
    revalidatePath("/admin/users");
  } catch {
    /* static export */
  }
}

export async function fetchLGUUsersForCompanyAction(
  lguId: string
): Promise<ActionResult<User[]>> {
  const { supabase, error } = await requireCompanyAdmin();
  if (error) return { success: false, error };

  const lguCheck = await assertLGUExists(supabase, lguId);
  if (!lguCheck.success) return lguCheck;

  const { data, error: queryError } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("lgu_id", lguId)
    .eq("account_type", "lgu")
    .order("is_primary_admin", { ascending: false })
    .order("full_name", { ascending: true });

  if (queryError) {
    return { success: false, error: queryError.message };
  }

  return {
    success: true,
    data: ((data ?? []) as ProfileRow[]).map(mapProfileRowToUser),
  };
}

export async function createLGUUserForCompanyAction(
  lguId: string,
  formData: FormData
): Promise<ActionResult<User>> {
  const { supabase, error } = await requireCompanyAdmin();
  if (error) return { success: false, error };

  const lguCheck = await assertLGUExists(supabase, lguId);
  if (!lguCheck.success) return lguCheck;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const position = String(formData.get("position") ?? "").trim();

  if (!name) return { success: false, error: "Name is required." };
  if (!email) return { success: false, error: "Email is required." };
  if (password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters.",
    };
  }

  const adminClient = createAdminClient();
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        account_type: "lgu",
        lgu_id: lguId,
      },
    });

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message ?? "Failed to create login account.",
    };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .insert({
      id: authData.user.id,
      account_type: "lgu",
      role: "sb_secretary",
      lgu_id: lguId,
      full_name: name,
      email,
      position: position || "LGU Staff",
      mobile: null,
      is_primary_admin: false,
      is_active: true,
      module_access: [...LGU_STAFF_MODULE_ACCESS],
    })
    .select(PROFILE_SELECT)
    .single();

  if (profileError || !profile) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return {
      success: false,
      error: profileError?.message ?? "Failed to create user profile.",
    };
  }

  safeRevalidate(lguId);
  return { success: true, data: mapProfileRowToUser(profile as ProfileRow) };
}

export async function toggleLGUUserActiveForCompanyAction(
  lguId: string,
  userId: string,
  isActive: boolean
): Promise<ActionResult<User>> {
  const { supabase, error } = await requireCompanyAdmin();
  if (error) return { success: false, error };

  const lguCheck = await assertLGUExists(supabase, lguId);
  if (!lguCheck.success) return lguCheck;

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("is_primary_admin")
    .eq("id", userId)
    .eq("lgu_id", lguId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { success: false, error: "User not found for this LGU." };
  }

  if (existing.is_primary_admin) {
    return {
      success: false,
      error: "The primary administrator account cannot be deactivated here.",
    };
  }

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)
    .eq("lgu_id", lguId)
    .select(PROFILE_SELECT)
    .single();

  if (updateError || !data) {
    return {
      success: false,
      error: updateError?.message ?? "Failed to update user access.",
    };
  }

  safeRevalidate(lguId);
  return { success: true, data: mapProfileRowToUser(data as ProfileRow) };
}

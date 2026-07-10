"use server";

import { revalidatePath } from "next/cache";
import { LGU_STAFF_MODULE_ACCESS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mapProfileRowToUser,
  PROFILE_SELECT,
  type ProfileRow,
} from "@/lib/supabase/profile-mapper";
import { requireLGUPrimaryAdmin } from "@/lib/supabase/require-lgu-user";
import type { User } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function safeRevalidateUsers() {
  try {
    revalidatePath("/admin/users");
  } catch {
    /* static export */
  }
}

export async function fetchLGUUsersAction(): Promise<ActionResult<User[]>> {
  try {
    const { session, error } = await requireLGUPrimaryAdmin();
    if (error || !session) return { success: false, error: error! };

    const { data, error: queryError } = await session.supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("lgu_id", session.lguId)
      .eq("account_type", "lgu")
      .order("is_primary_admin", { ascending: false })
      .order("full_name", { ascending: true });

    if (queryError) {
      return { success: false, error: queryError.message };
    }

    const users = ((data ?? []) as ProfileRow[]).map(mapProfileRowToUser);
    return { success: true, data: users };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to load users."),
    };
  }
}

export async function createLGUUserAction(
  formData: FormData
): Promise<ActionResult<User>> {
  try {
    const { session, error } = await requireLGUPrimaryAdmin();
    if (error || !session) return { success: false, error: error! };

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const position = String(formData.get("position") ?? "").trim();

    if (!name) {
      return { success: false, error: "Name is required." };
    }
    if (!email) {
      return { success: false, error: "Email is required." };
    }
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
          lgu_id: session.lguId,
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
        lgu_id: session.lguId,
        full_name: name,
        email,
        position: position || "LGU Staff",
        mobile: null,
        is_primary_admin: false,
        is_active: true,
        module_access: [...LGU_STAFF_MODULE_ACCESS],
        managed_password: password,
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

    safeRevalidateUsers();
    return {
      success: true,
      data: mapProfileRowToUser(profile as ProfileRow),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to create user."),
    };
  }
}

export async function updateLGUUserAction(
  id: string,
  formData: FormData
): Promise<ActionResult<User>> {
  try {
    const { session, error } = await requireLGUPrimaryAdmin();
    if (error || !session) return { success: false, error: error! };

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const position = String(formData.get("position") ?? "").trim();
    const mobile = String(formData.get("mobile") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (!name) {
      return { success: false, error: "Name is required." };
    }
    if (!email) {
      return { success: false, error: "Email is required." };
    }

    const { data: existing, error: fetchError } = await session.supabase
      .from("profiles")
      .select("id, is_primary_admin, email")
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: "User not found in your LGU account." };
    }

    const profileUpdate: Record<string, string> = {
      full_name: name,
      email,
      position: position || (existing.is_primary_admin ? "" : "LGU Staff"),
    };

    if (existing.is_primary_admin) {
      profileUpdate.mobile = mobile;
    }

    if (password.length > 0) {
      profileUpdate.managed_password = password;
    }

    const { data, error: updateError } = await session.supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .select(PROFILE_SELECT)
      .single();

    if (updateError || !data) {
      return {
        success: false,
        error: updateError?.message ?? "Failed to update user.",
      };
    }

    if (existing.is_primary_admin) {
      const { error: lguUpdateError } = await session.supabase
        .from("lgus")
        .update({
          admin_full_name: name,
          admin_position: position,
          admin_office_email: email,
          admin_mobile_number: mobile,
        })
        .eq("id", session.lguId);

      if (lguUpdateError) {
        return { success: false, error: lguUpdateError.message };
      }
    }

    if (password.length > 0) {
      if (password.length < 8) {
        return {
          success: false,
          error: "Password must be at least 8 characters.",
        };
      }

      const adminClient = createAdminClient();
      const { error: passwordError } =
        await adminClient.auth.admin.updateUserById(id, { password });

      if (passwordError) {
        return { success: false, error: passwordError.message };
      }
    }

    if (email !== existing.email) {
      const adminClient = createAdminClient();
      const { error: emailError } =
        await adminClient.auth.admin.updateUserById(id, { email });
      if (emailError) {
        return { success: false, error: emailError.message };
      }
    }

    safeRevalidateUsers();
    try {
      revalidatePath("/admin/profile");
    } catch {
      /* static export */
    }

    return {
      success: true,
      data: mapProfileRowToUser(data as ProfileRow),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to update user."),
    };
  }
}

export async function toggleLGUUserActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<User>> {
  try {
    const { session, error } = await requireLGUPrimaryAdmin();
    if (error || !session) return { success: false, error: error! };

    if (id === session.userId) {
      return {
        success: false,
        error: "You cannot deactivate your own account.",
      };
    }

    const { data: existing, error: fetchError } = await session.supabase
      .from("profiles")
      .select("is_primary_admin")
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: "User not found in your LGU account." };
    }

    if (existing.is_primary_admin) {
      return {
        success: false,
        error: "The primary administrator account cannot be deactivated.",
      };
    }

    const { data, error: updateError } = await session.supabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .select(PROFILE_SELECT)
      .single();

    if (updateError || !data) {
      return {
        success: false,
        error: updateError?.message ?? "Failed to update user status.",
      };
    }

    safeRevalidateUsers();
    return {
      success: true,
      data: mapProfileRowToUser(data as ProfileRow),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to update user status."),
    };
  }
}

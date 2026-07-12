"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PasswordResetResult =
  | { success: true; message: string }
  | { success: false; error: string };

const GENERIC_SENT_MESSAGE =
  "If that email matches an LGU main admin account, a reset link has been sent. Check your inbox and spam folder.";

function createAnonAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public environment variables.");
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isStrongPassword(password: string) {
  return password.length >= 8;
}

/**
 * Sends a Supabase recovery email for an active LGU primary (main) admin only.
 * Always returns a generic success message to avoid account enumeration.
 */
export async function requestLguPasswordResetAction(
  email: string,
  redirectTo: string
): Promise<PasswordResetResult> {
  try {
    const normalized = normalizeEmail(email);

    if (!normalized || !normalized.includes("@")) {
      return { success: false, error: "Enter a valid email address." };
    }

    if (
      !redirectTo.startsWith("http://") &&
      !redirectTo.startsWith("https://")
    ) {
      return { success: false, error: "Invalid reset redirect URL." };
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, account_type, is_active, is_primary_admin")
      .eq("email", normalized)
      .maybeSingle();

    const eligible =
      profile &&
      profile.account_type === "lgu" &&
      profile.is_active === true &&
      profile.is_primary_admin === true;

    if (eligible) {
      const authClient = createAnonAuthClient();
      const { error } = await authClient.auth.resetPasswordForEmail(normalized, {
        redirectTo,
      });

      if (error) {
        console.error("resetPasswordForEmail failed:", error.message);
      }
    }

    return { success: true, message: GENERIC_SENT_MESSAGE };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to send reset email. Please try again.",
    };
  }
}

/**
 * Completes password recovery for the signed-in recovery session user.
 * Updates Auth password and profiles.managed_password.
 */
export async function completeLguPasswordResetAction(
  password: string,
  confirmPassword: string
): Promise<PasswordResetResult> {
  try {
    if (!isStrongPassword(password)) {
      return {
        success: false,
        error: "Password must be at least 8 characters.",
      };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "This reset link is invalid or has expired. Request a new one.",
      };
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, account_type, is_active, is_primary_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (
      !profile ||
      profile.account_type !== "lgu" ||
      profile.is_active !== true ||
      profile.is_primary_admin !== true
    ) {
      return {
        success: false,
        error: "Password reset is only available for LGU main admin accounts.",
      };
    }

    const { error: authError } = await admin.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (authError) {
      return { success: false, error: authError.message };
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ managed_password: password })
      .eq("id", user.id);

    if (profileError) {
      return {
        success: false,
        error: profileError.message ?? "Password updated, but profile sync failed.",
      };
    }

    return {
      success: true,
      message: "Your password has been updated. You can sign in now.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update password. Please try again.",
    };
  }
}

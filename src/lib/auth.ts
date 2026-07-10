import { createClient } from "@/lib/supabase/client";
import { mapProfileRowToUser, type ProfileRow } from "@/lib/supabase/profile-mapper";
import type { AccountPortal, CompanyAdmin, User } from "./types";

export type LoginResult =
  | {
      success: true;
      portal: AccountPortal;
      redirectTo: string;
      user?: User;
      companyAdmin?: CompanyAdmin;
    }
  | { success: false; error?: string };

interface ProfileRowLegacy extends ProfileRow {}

function mapProfileToUser(profile: ProfileRowLegacy): User {
  return mapProfileRowToUser(profile);
}

function mapProfileToCompanyAdmin(profile: ProfileRow): CompanyAdmin {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
  };
}

export async function authenticate(
  email: string,
  password: string
): Promise<LoginResult> {
  const supabase = createClient();

  let authData;
  let authError;

  try {
    const result = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    authData = result.data;
    authError = result.error;
  } catch {
    return {
      success: false,
      error:
        "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL matches your project keys, then restart the dev server.",
    };
  }

  if (authError || !authData.user) {
    return { success: false, error: authError?.message ?? "Login failed." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, account_type, role, lgu_id, full_name, email, position, mobile, is_active, is_primary_admin, module_access, allowed_categories, last_login_at, created_at"
    )
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { success: false, error: "Profile not found for this account." };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { success: false, error: "This account has been deactivated." };
  }

  void supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", profile.id);

  if (profile.account_type === "company") {
    return {
      success: true,
      portal: "company",
      redirectTo: "/super-admin/dashboard",
      companyAdmin: mapProfileToCompanyAdmin(profile as ProfileRow),
    };
  }

  if (!profile.lgu_id || !profile.role) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "This LGU account is not linked to a registered LGU.",
    };
  }

  const { data: lgu, error: lguError } = await supabase
    .from("lgus")
    .select("status")
    .eq("id", profile.lgu_id)
    .single();

  if (lguError || !lgu) {
    await supabase.auth.signOut();
    return { success: false, error: "Registered LGU record was not found." };
  }

  if (lgu.status === "suspended") {
    await supabase.auth.signOut();
    return {
      success: false,
      error:
        "This LGU account has been blocked. Contact LegisArc support for assistance.",
    };
  }

  return {
    success: true,
    portal: "lgu",
    redirectTo: "/admin/dashboard",
    user: mapProfileToUser(profile as ProfileRow),
  };
}

export async function loadSessionFromSupabase(): Promise<LoginResult | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, account_type, role, lgu_id, full_name, email, position, mobile, is_active, is_primary_admin, module_access, allowed_categories, last_login_at, created_at"
    )
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return null;
  }

  if (profile.account_type === "company") {
    return {
      success: true,
      portal: "company",
      redirectTo: "/super-admin/dashboard",
      companyAdmin: mapProfileToCompanyAdmin(profile as ProfileRow),
    };
  }

  if (!profile.lgu_id || !profile.role) {
    await supabase.auth.signOut();
    return null;
  }

  const { data: lgu } = await supabase
    .from("lgus")
    .select("status")
    .eq("id", profile.lgu_id)
    .single();

  if (lgu?.status === "suspended") {
    await supabase.auth.signOut();
    return null;
  }

  return {
    success: true,
    portal: "lgu",
    redirectTo: "/admin/dashboard",
    user: mapProfileToUser(profile as ProfileRow),
  };
}

export async function signOutFromSupabase(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

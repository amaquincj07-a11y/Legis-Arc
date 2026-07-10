"use server";

import { addYears, startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { LGU_STAFF_MODULE_ACCESS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LGU_SELECT,
  mapLguRowToClient,
  toPlaceStorageKey,
  type LguRow,
} from "@/lib/supabase/lgu-mapper";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateLGUAccountInput,
  LGUClient,
  LGUClientStatus,
  LGUAdministrator,
} from "@/lib/types";

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

export async function fetchLGUClientsAction(): Promise<ActionResult<LGUClient[]>> {
  const { supabase, error } = await requireCompanyAdmin();
  if (error) return { success: false, error };

  const { data, error: queryError } = await supabase
    .from("lgus")
    .select(LGU_SELECT)
    .order("created_at", { ascending: false });

  if (queryError) {
    return { success: false, error: queryError.message };
  }

  return {
    success: true,
    data: (data as LguRow[]).map(mapLguRowToClient),
  };
}

export async function fetchLGUClientByIdAction(
  id: string
): Promise<ActionResult<LGUClient>> {
  const { supabase, error } = await requireCompanyAdmin();
  if (error) return { success: false, error };

  const { data, error: queryError } = await supabase
    .from("lgus")
    .select(LGU_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (queryError) {
    return { success: false, error: queryError.message };
  }

  if (!data) {
    return { success: false, error: "LGU not found." };
  }

  return { success: true, data: mapLguRowToClient(data as LguRow) };
}

export async function createLGUClientAction(
  input: CreateLGUAccountInput
): Promise<ActionResult<LGUClient>> {
  const { supabase, error } = await requireCompanyAdmin();
  if (error) return { success: false, error };

  const province = toPlaceStorageKey(input.province);
  const municipality = toPlaceStorageKey(input.municipality);
  const admin = input.administrator;

  const { data: existing } = await supabase
    .from("lgus")
    .select("id")
    .eq("province", province)
    .eq("municipality", municipality)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "An LGU account already exists for this municipality.",
    };
  }

  const { data: lguRow, error: insertError } = await supabase
    .from("lgus")
    .insert({
      province,
      municipality,
      status: "trial",
      subscription_amount: 100000,
      document_count: 0,
      admin_full_name: admin.fullName.trim(),
      admin_position: admin.position.trim(),
      admin_office_email: admin.officeEmail.trim().toLowerCase(),
      admin_mobile_number: admin.mobileNumber.trim(),
      support_plan: "annual",
    })
    .select("id")
    .single();

  if (insertError || !lguRow) {
    return {
      success: false,
      error: insertError?.message ?? "Failed to create LGU record.",
    };
  }

  const adminClient = createAdminClient();
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: admin.officeEmail.trim().toLowerCase(),
      password: admin.password,
      email_confirm: true,
      user_metadata: {
        full_name: admin.fullName.trim(),
        account_type: "lgu",
        lgu_id: lguRow.id,
      },
    });

  if (authError || !authData.user) {
    await adminClient.from("lgus").delete().eq("id", lguRow.id);
    return {
      success: false,
      error: authError?.message ?? "Failed to create administrator login.",
    };
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: authData.user.id,
    account_type: "lgu",
    role: "sb_secretary",
    lgu_id: lguRow.id,
    full_name: admin.fullName.trim(),
    email: admin.officeEmail.trim().toLowerCase(),
    position: admin.position.trim(),
    mobile: admin.mobileNumber.trim(),
    is_primary_admin: true,
    is_active: true,
    module_access: [...LGU_STAFF_MODULE_ACCESS],
    managed_password: admin.password,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    await adminClient.from("lgus").delete().eq("id", lguRow.id);
    return { success: false, error: profileError.message };
  }

  await adminClient.rpc("seed_default_document_categories", {
    target_lgu_id: lguRow.id,
  });

  revalidatePath("/super-admin/lgus");
  revalidatePath("/super-admin/dashboard");

  const created = await fetchLGUClientByIdAction(lguRow.id);
  if (!created.success) {
    return created;
  }

  return { success: true, data: created.data };
}

export async function updateLGUProfileAction(
  id: string,
  administrator: LGUAdministrator,
  password?: string
): Promise<ActionResult<LGUClient>> {
  const { supabase, error } = await requireCompanyAdmin();
  if (error) return { success: false, error };

  const { data: lguRow, error: fetchError } = await supabase
    .from("lgus")
    .select("id, profiles(id, is_primary_admin)")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !lguRow) {
    return { success: false, error: fetchError?.message ?? "LGU not found." };
  }

  const { error: updateLguError } = await supabase
    .from("lgus")
    .update({
      admin_full_name: administrator.fullName.trim(),
      admin_position: administrator.position.trim(),
      admin_office_email: administrator.officeEmail.trim().toLowerCase(),
      admin_mobile_number: administrator.mobileNumber.trim(),
    })
    .eq("id", id);

  if (updateLguError) {
    return { success: false, error: updateLguError.message };
  }

  const profiles = (lguRow.profiles ?? []) as {
    id: string;
    is_primary_admin: boolean;
  }[];
  const primaryProfile =
    profiles.find((profile) => profile.is_primary_admin) ?? profiles[0];

  if (primaryProfile) {
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        full_name: administrator.fullName.trim(),
        email: administrator.officeEmail.trim().toLowerCase(),
        position: administrator.position.trim(),
        mobile: administrator.mobileNumber.trim(),
        ...(password?.trim() ? { managed_password: password.trim() } : {}),
      })
      .eq("id", primaryProfile.id);

    if (profileUpdateError) {
      return { success: false, error: profileUpdateError.message };
    }

    if (password?.trim()) {
      const adminClient = createAdminClient();
      const { error: passwordError } =
        await adminClient.auth.admin.updateUserById(primaryProfile.id, {
          password: password.trim(),
          email: administrator.officeEmail.trim().toLowerCase(),
        });

      if (passwordError) {
        return { success: false, error: passwordError.message };
      }
    }
  }

  revalidatePath(`/super-admin/lgus/${id}`);
  revalidatePath("/super-admin/lgus");

  const updated = await fetchLGUClientByIdAction(id);
  return updated;
}

export async function updateLGUSubscriptionAction(
  id: string,
  patch: {
    status?: LGUClientStatus;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  },
  options?: { recordPeriod?: boolean }
): Promise<ActionResult<LGUClient>> {
  const { supabase, error } = await requireCompanyAdmin();
  if (error) return { success: false, error };

  const { data: existing, error: fetchError } = await supabase
    .from("lgus")
    .select("subscription_amount")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { success: false, error: fetchError?.message ?? "LGU not found." };
  }

  const updatePayload: Record<string, string> = {};
  if (patch.status) updatePayload.status = patch.status;
  if (patch.subscriptionStartDate) {
    updatePayload.subscription_start_date =
      patch.subscriptionStartDate.toISOString();
  }
  if (patch.subscriptionEndDate) {
    updatePayload.subscription_end_date =
      patch.subscriptionEndDate.toISOString();
  }

  const { error: updateError } = await supabase
    .from("lgus")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (
    options?.recordPeriod &&
    patch.subscriptionStartDate &&
    patch.subscriptionEndDate
  ) {
    const { error: periodError } = await supabase
      .from("lgu_subscription_periods")
      .insert({
        lgu_id: id,
        start_date: patch.subscriptionStartDate.toISOString(),
        end_date: patch.subscriptionEndDate.toISOString(),
        amount: existing.subscription_amount,
        activated_at: new Date().toISOString(),
      });

    if (periodError) {
      return { success: false, error: periodError.message };
    }
  }

  revalidatePath(`/super-admin/lgus/${id}`);
  revalidatePath("/super-admin/lgus");
  revalidatePath("/super-admin/dashboard");
  revalidatePath("/admin/billing");

  return fetchLGUClientByIdAction(id);
}

export async function activateLGUPaidSubscriptionTodayAction(
  id: string
): Promise<ActionResult<LGUClient>> {
  const subscriptionStartDate = startOfDay(new Date());
  const subscriptionEndDate = addYears(subscriptionStartDate, 1);

  return updateLGUSubscriptionAction(
    id,
    {
      status: "active",
      subscriptionStartDate,
      subscriptionEndDate,
    },
    { recordPeriod: true }
  );
}

export async function blockLGUAccessAction(
  id: string
): Promise<ActionResult<LGUClient>> {
  return updateLGUSubscriptionAction(id, { status: "suspended" });
}

export async function unblockLGUAccessAction(
  id: string
): Promise<ActionResult<LGUClient>> {
  const current = await fetchLGUClientByIdAction(id);
  if (!current.success) return current;

  const { resolveStatusAfterUnblock } = await import("@/lib/lgu-subscription");
  const status = resolveStatusAfterUnblock(current.data);

  return updateLGUSubscriptionAction(id, { status });
}

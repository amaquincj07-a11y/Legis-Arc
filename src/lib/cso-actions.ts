"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import {
  CSO_SELECT,
  mapCSORowToOrganization,
  type CSORow,
} from "@/lib/supabase/cso-mapper";
import { recordLGUActivity } from "@/lib/activity-log";
import { requireLGUSession } from "@/lib/supabase/require-lgu-user";
import type { CSOOrganization } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function safeRevalidateCSO() {
  const paths = ["/admin/cso", "/cso"];
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      /* static export — no cache to revalidate */
    }
  }
}

export async function fetchCSOOrganizationsAction(): Promise<
  ActionResult<CSOOrganization[]>
> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const { data, error: queryError } = await session.supabase
      .from("cso_organizations")
      .select(CSO_SELECT)
      .eq("lgu_id", session.lguId)
      .order("name", { ascending: true });

    if (queryError) {
      return { success: false, error: queryError.message };
    }

    const organizations = ((data ?? []) as CSORow[]).map(mapCSORowToOrganization);
    return { success: true, data: organizations };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to load CSO organizations."),
    };
  }
}

export async function createCSOOrganizationAction(
  formData: FormData
): Promise<ActionResult<CSOOrganization>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const name = String(formData.get("name") ?? "").trim();
    const officerName = String(formData.get("officerName") ?? "").trim();
    const position = String(formData.get("position") ?? "").trim();
    const term = String(formData.get("term") ?? "").trim();

    if (!name) {
      return { success: false, error: "Please enter the name of the association." };
    }
    if (!officerName) {
      return { success: false, error: "Please enter the name of the officer." };
    }
    if (!term) {
      return { success: false, error: "Please select or enter a year term." };
    }
    if (!position) {
      return { success: false, error: "Please enter the position." };
    }

    const organizationId = randomUUID();

    const { data, error: insertError } = await session.supabase
      .from("cso_organizations")
      .insert({
        id: organizationId,
        lgu_id: session.lguId,
        name,
        officer_name: officerName,
        position,
        term,
        created_by: session.userId,
      })
      .select(CSO_SELECT)
      .single();

    if (insertError || !data) {
      return {
        success: false,
        error: insertError?.message ?? "Failed to add CSO organization.",
      };
    }

    safeRevalidateCSO();
    await recordLGUActivity({
      session,
      action: "upload",
      module: "cso",
      entityId: organizationId,
      entityTitle: name,
      details: `Added CSO organization "${name}"`,
    });
    return {
      success: true,
      data: mapCSORowToOrganization(data as CSORow),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to add CSO organization."),
    };
  }
}

export async function updateCSOOrganizationAction(
  id: string,
  formData: FormData
): Promise<ActionResult<CSOOrganization>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const name = String(formData.get("name") ?? "").trim();
    const officerName = String(formData.get("officerName") ?? "").trim();
    const position = String(formData.get("position") ?? "").trim();
    const term = String(formData.get("term") ?? "").trim();

    if (!name) {
      return { success: false, error: "Please enter the name of the association." };
    }
    if (!officerName) {
      return { success: false, error: "Please enter the name of the officer." };
    }
    if (!term) {
      return { success: false, error: "Please select or enter a year term." };
    }
    if (!position) {
      return { success: false, error: "Please enter the position." };
    }

    const { data, error: updateError } = await session.supabase
      .from("cso_organizations")
      .update({
        name,
        officer_name: officerName,
        position,
        term,
      })
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .select(CSO_SELECT)
      .single();

    if (updateError || !data) {
      return {
        success: false,
        error: updateError?.message ?? "Failed to update CSO organization.",
      };
    }

    safeRevalidateCSO();
    await recordLGUActivity({
      session,
      action: "edit",
      module: "cso",
      entityId: id,
      entityTitle: name,
      details: `Updated CSO organization "${name}"`,
    });
    return {
      success: true,
      data: mapCSORowToOrganization(data as CSORow),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to update CSO organization."),
    };
  }
}

export async function deleteCSOOrganizationAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const { data: existing, error: fetchError } = await session.supabase
      .from("cso_organizations")
      .select("name")
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: "CSO organization not found." };
    }

    const { error: deleteError } = await session.supabase
      .from("cso_organizations")
      .delete()
      .eq("id", id)
      .eq("lgu_id", session.lguId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    safeRevalidateCSO();
    await recordLGUActivity({
      session,
      action: "delete",
      module: "cso",
      entityId: id,
      entityTitle: existing.name as string,
      details: `Deleted CSO organization "${existing.name}"`,
    });
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to delete CSO organization."),
    };
  }
}

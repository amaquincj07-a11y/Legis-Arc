"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  CSO_SELECT,
  mapCSORowToOrganization,
  type CSORow,
} from "@/lib/supabase/cso-mapper";
import { toPlaceStorageKey } from "@/lib/supabase/lgu-mapper";
import type { CSOOrganization } from "@/lib/types";

export type PublicActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function resolveLguId(
  province: string,
  municipality: string
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lgus")
    .select("id")
    .eq("province", toPlaceStorageKey(province))
    .eq("municipality", toPlaceStorageKey(municipality))
    .maybeSingle();

  if (error || !data) return null;
  return data.id as string;
}

export async function fetchPublicCSOOrganizationsAction(
  province: string,
  municipality: string
): Promise<PublicActionResult<CSOOrganization[]>> {
  try {
    const lguId = await resolveLguId(province, municipality);
    if (!lguId) {
      return { success: true, data: [] };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("cso_organizations")
      .select(CSO_SELECT)
      .eq("lgu_id", lguId)
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const organizations = ((data ?? []) as CSORow[]).map(mapCSORowToOrganization);
    return { success: true, data: organizations };
  } catch {
    return { success: false, error: "Failed to load CSO organizations." };
  }
}

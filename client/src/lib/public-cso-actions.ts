"use server";

import { apiGetPublic, publicPlacePath } from "@/lib/api/client";
import {
  mapCSORowToOrganization,
  type CSORow,
} from "@/lib/mappers/cso-mapper";
import type { CSOOrganization } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchPublicCSOOrganizationsAction(
  province: string,
  municipality: string
): Promise<ActionResult<CSOOrganization[]>> {
  try {
    const path = publicPlacePath(province, municipality, "/cso");
    const rows = await apiGetPublic<CSORow[]>(path);
    return {
      success: true,
      data: rows.map(mapCSORowToOrganization),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load CSOs.",
    };
  }
}

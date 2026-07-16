"use server";

import { revalidatePath } from "next/cache";
import {
  apiGetAuth,
  apiPostAuth,
  apiPatchAuth,
  apiDeleteAuth,
} from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import {
  mapCSORowToOrganization,
  type CSORow,
} from "@/lib/mappers/cso-mapper";
import type { CSOOrganization } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function formDataToCsoBody(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    officerName: String(formData.get("officerName") ?? "").trim(),
    term: String(formData.get("term") ?? "").trim(),
    position: String(formData.get("position") ?? "").trim(),
  };
}

export async function fetchCSOOrganizationsAction(): Promise<
  ActionResult<CSOOrganization[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<CSORow[]>("/api/admin/cso", token);
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

export async function createCSOOrganizationAction(
  formData: FormData
): Promise<ActionResult<CSOOrganization>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<CSORow>(
      "/api/admin/cso",
      token,
      formDataToCsoBody(formData)
    );
    revalidatePath("/admin/cso");
    revalidatePath("/cso");
    return { success: true, data: mapCSORowToOrganization(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create CSO.",
    };
  }
}

export async function updateCSOOrganizationAction(
  id: string,
  formData: FormData
): Promise<ActionResult<CSOOrganization>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPatchAuth<CSORow>(
      `/api/admin/cso/${id}`,
      token,
      formDataToCsoBody(formData)
    );
    revalidatePath("/admin/cso");
    revalidatePath("/cso");
    return { success: true, data: mapCSORowToOrganization(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update CSO.",
    };
  }
}

export async function deleteCSOOrganizationAction(
  id: string
): Promise<ActionResult<null>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await apiDeleteAuth(`/api/admin/cso/${id}`, token);
    revalidatePath("/admin/cso");
    revalidatePath("/cso");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete CSO.",
    };
  }
}
